import { NextFunction, Request,Response } from "express";
import { Redis } from "ioredis";
import { SpeakeasyAuthMixinExt } from "../extensions/speakeasy.ext";
import { EmailQueuingService } from "../services/email.svc";
import { IOPTAuthSecret} from "../interfaces";
import { UserServices } from "../services/user/user.svc";
import { AdminServices } from "../services/user/admin.svc";
import { MFAs, Roles} from "../enums";
import generalConstants from "../utils/constants/general.const";
import { Unauthorized as UnauthorizedError, BadRequestError } from "../errors/client";
import { graphqlConstants } from "../utils/constants/graphql.const";
import { authErrorConstants } from "../utils/constants/error.const";
import { UserAuthentication } from "../utils/userAuth.util";
import { UserUtilities } from "../utils/users.util";
import { JwtPayload } from "jsonwebtoken";

class AccountController extends SpeakeasyAuthMixinExt(class {}) {
	// services
	private userUtilities = new UserUtilities();
	private adminServices = new AdminServices();
	private userServices = new UserServices();
	private emailQueuing = new EmailQueuingService();
	private mfaType = MFAs.googleAuth;
	private readonly store: Redis;

	constructor (store: Redis) {
		super();
		this.store = store;
	}

	// all admin accounts are advice to use this route instead of the graph route
	// since it supports MFA
	public async login(req: Request, res: Response, next: NextFunction)
	: Promise<void> {
		try {
			const userAuthentication = new UserAuthentication({ store: this.store });
			const loginCredentials = req.body;

			if (!loginCredentials.email || !loginCredentials.password) {
				return next(new BadRequestError(authErrorConstants.invalidUsernameAndPassword));
			}

			if (!loginCredentials.role) {
				return next(new BadRequestError(authErrorConstants.invalidUserRole));
			}

			const { email, password, role } = loginCredentials;
			const { exist, payload } = await this.userUtilities
				.checkUserExistenceWithPayload(email, role);

			if (!exist) {
				return next(new BadRequestError(graphqlConstants.mutations.loginUser.noMatch));
			}

			const hashCodes = [password, email];
			const isValidPassword = await UserAuthentication.checkAccessToken(hashCodes.join(""),
				payload.password);
			if (!isValidPassword) {
				return next(new BadRequestError(graphqlConstants.mutations.loginUser.wrongCredentials));
			}

			await userAuthentication.login(payload);
			if (!userAuthentication.isAuthenticated) return;
			const token = userAuthentication.currentUserToken;

			// check if the user is admin and MFA is enabled for the account
			if (role === Roles.admin.toLocaleLowerCase()) {
				const mfaEnabled = await this.adminServices.isMfaEnabled(payload.id);
				if (mfaEnabled) {
					const totp_token = req.query?.totp_token;
					if (!totp_token) {
						return next(new BadRequestError(authErrorConstants.missingTotpToken));
					}
					return res.redirect(307, `${generalConstants.oneTimePassword.validateRoute}?access_token=${token.jwtToken}&totp_token=${totp_token}&redirected=true`);
				}
			}

			const response = await UserUtilities.mapUserSignupResponse(payload, token, "local");
			res.status(200).json(response);
		} catch (err) {
			return next(err);
		}
	}

	public async add2FA (req: Request, res: Response, next: NextFunction)
	: Promise<void> {
		try {
			const user = req.user as JwtPayload;
			const id = user?.id;

			const otpResponse: IOPTAuthSecret = this.getTwoFactorAuthenticationCode(user?.email);
			const qrCode = await this.generateQrCode(otpResponse.otpAuthUrl);
			const updatedUser = await this.adminServices.addTwoFA(id, otpResponse.base32);

			if (!updatedUser.ok) {
				return next(new UnauthorizedError("Couldn't find account. Try again with an admin privileges"));
			}

			if (!updatedUser.n) {
				res.status(202).json({
					status: "success",
					message: `You are already registered on ${this.mfaType}`
				});
				return;
			}

			res.status(200).json({
				status: "success",
				message: `The 2FA with ${this.mfaType} has been added successfully`,
				data: {
					secretKey: otpResponse.base32,
					qrCode
				}
			});
		} catch (error) {
			return next(error);
		}
	}

	public async verify2FA (req: Request, res: Response, next: NextFunction)
	: Promise<void> {
		try {
			const user = req.user as JwtPayload;
			const id: string = user?.id;
			const email: string = user?.email;
			const totpToken = req.query?.totp_token as string;

			const verified = await this.adminServices.checkTwoFaVerificationStatus(id);
			if (verified) {
				res.status(202).json({
					status: "success",
					message: `The OTP account '${this.mfaType}' has already been verified`,
				});
				return;
			}

			const tempSecret = await this.adminServices.getTwoFaTemporalSecret(id);
			await this.verifyTwoFactorAuthenticationSecret(tempSecret, totpToken);

			const updateResponse = await this.adminServices.addTwoFaPermanentSecret(tempSecret);
			if (!updateResponse.ok) {
				return next(new BadRequestError("There was problem updating user's OTP secret"));
			}

			// send success email
			await this.emailQueuing.queue.add(generalConstants.jobNames.sendMFASuccessMessage,
				{ email });

			res.status(200).json({
				status: "success",
				message: "The OTP has been verified successfully. 2FA setup is completed",
			});
		} catch (err) {
			return next(err);
		}
	}

	public async validateTotpToken(req: Request, res: Response, next: NextFunction)
	: Promise<void> {
		try {
			const user = req.user as JwtPayload;
			const id: string = user?.id;
			const totpToken = req.query?.totp_token as string;
			const redirected = !!(req.query?.redirected as string);
			const accessToken = req.query?.access_token as string;
			const mfaAccountVerified = await this.adminServices.checkTwoFaVerificationStatus(id);
			const tokenSession = await this.store.get(generalConstants.tokenRedisKey);

			if (!mfaAccountVerified) {
				return next(new BadRequestError(authErrorConstants.unverifiedMfaAccount));
			}

			const secret = await this.adminServices.getTwoFaSecret(id);
			await this.verifyTwoFactorAuthenticationSecret(secret, totpToken);

			// when redirected from the login route
			if (redirected && accessToken === JSON.parse(tokenSession).jwtToken) {
				res.status(200).json({
					status: "success",
					message: "Login successfully",
					data: {
						...user,
						token: accessToken
					}
				});
				return;
			}

			res.status(200).json({
				status: "success",
				message: `The OTP token from '${this.mfaType}' has been validated successfully`,
			});
		} catch (err) {
			return next(err);
		}
	}

	public async verifyEmail(req: Request, res: Response, next: NextFunction)
	: Promise<void> {
		try {
			const verified = await this.userServices.verifyEmail(req.params._id,
				req.query.verify as string);
			if (!verified) res.send(generalConstants.emailVerificationError);

			return res.redirect(generalConstants.home);
		} catch (err) {
			return next(err);
		}
	}

	public async enableMfa(req: Request, res: Response, next: NextFunction)
		: Promise<void> {
		try {
			const user: JwtPayload = req.user;
			const id: string = user?.id;
			const redirected = !!(req.query?.redirected as string);
			const redirectUrl = req.query?.redirect_url as string;
			await this.adminServices.enableMfa(id);

			if (redirected && redirectUrl) {
				return res.redirect(307, redirectUrl);
			}

			res.status(200).json({
				status: "success",
				message: "MFA is enabled for this account successfully",
			});
		} catch (err) {
			return next(err);
		}
	}

	public async disableMfa(req: Request, res: Response, next: NextFunction)
		: Promise<void> {
		try {
			const user: JwtPayload = req.user;
			const id: string = user?.id;
			await this.adminServices.disableMfa(id);

			res.status(200).json({
				status: "success",
				message: "MFA is disabled for this account successfully",
			});
		} catch (err) {
			return next(err);
		}
	}
}

export { AccountController };

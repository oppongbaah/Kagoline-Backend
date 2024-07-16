import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { Request } from "express";
import {
	IUserAccessAndHashTokens,
	ILoginToken,
	ILoginResponseRawUserData,
	IUserResponseRawData,
	IAuthOptions,
	IContextStore,
	ISocialMediaTokenPayload,
	IFacebookUserCredentials,
	IAuthError,
	SignupCallback
} from "../interfaces";
import { Roles,
	AuthErrorCodes,
	HashAndEncodeAlgorithms,
	AuthOProviders
} from "../enums";
import generalConstants from "./constants/general.const";
import { authErrorConstants } from "./constants/error.const";
import { Redis } from "ioredis";
import { BadRequestError, NotFoundError } from "../errors/client";
import { UserUtilities } from "./users.util";
import logger from "../extensions/logger";

dotenv.config();

class UserAuthentication {
	private store: Redis;
	private authenticated = false;
	private currentToken: ILoginToken;

	private static algorithm = HashAndEncodeAlgorithms.aes256;
	private static key = crypto.randomBytes(32);
	private static iv = crypto.randomBytes(16);

	constructor(options: IAuthOptions) {
		this.store = options.store;
	}

	public static generateJwtToken (email: string, role: string, id: string) {
		const jwtExpireTime = parseInt(process.env.JWT_ACCESS_TOKEN_TIME, 10);
		const expiration = process.env.JWT_ACCESS_TOKEN_EXP;

		const jwtSecret = process.env.JWT_SECRET;
		const bufferSecret = Buffer.from(jwtSecret, "base64");
		const timer = new Date();
		timer.setUTCHours(timer.getUTCHours() + jwtExpireTime);

		const payload: JwtPayload = { email, role, id };

		const jwtToken = jwt.sign(payload, bufferSecret, {
			algorithm: HashAndEncodeAlgorithms.hs256,
			expiresIn: expiration
		});

		return { jwtToken, expiration: timer };
	}

	public static hashAccessToken = async (token: string): Promise<string> => {
		return bcrypt.hash(token, 12);
	};

	public static generateUserAccessToken = async ()
		: Promise<IUserAccessAndHashTokens> => {
		const data = crypto.randomInt(0, 1000000);
		const accessToken = data.toString().padStart(6, "0");
		const hashedToken = await this.hashAccessToken(accessToken);
		return {
			accessToken,
			hashedToken
		} as IUserAccessAndHashTokens;
	};

	public static checkAccessToken = async (accessToken: string, hashedToken: string)
		: Promise<boolean> => {
		return bcrypt.compare(accessToken, hashedToken);
	};

	public static encrypt(text: string): string {
		const cipher = crypto.createCipheriv(UserAuthentication.algorithm,
			Buffer.from(UserAuthentication.key), UserAuthentication.iv);
		let encrypted = cipher.update(text);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return encrypted.toString("hex");
	}

	public static decrypt(encryptedData: string): string {
		const iv = Buffer.from(UserAuthentication.iv.toString("hex"), "hex");
		const encryptedText = Buffer.from(encryptedData, "hex");
		const decipher = crypto.createDecipheriv(UserAuthentication.algorithm,
			Buffer.from(UserAuthentication.key), iv);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async signup(user: IUserResponseRawData, done: any): Promise<string> {
		const { accessToken, hashedToken } = await UserAuthentication.generateUserAccessToken();
		done(hashedToken);
		await this.login(user);

		return accessToken;
	}

	public async login(user: Partial<ILoginResponseRawUserData>)
	: Promise<void> {
		// clear token in session
		this.logout();
		// generate a token and store it in the redis session store
		const token: ILoginToken = UserAuthentication.generateJwtToken(user.email,
			user.role, user._id);
		await this.store.set(generalConstants.tokenRedisKey, JSON.stringify(token),
			"EX", token.expiration.getTime());
		this.authenticated = true;
		this.currentToken = token;
	}

	public async loginToSocialAccount(accessToken: string, provider: string, signupCallback
	: SignupCallback = null): Promise<ILoginToken> {
		// clear token in session
		this.logout();
		if (provider === AuthOProviders.FACEBOOK) {
			const { expires_at, is_valid } = await UserUtilities.debugFacebookAccessToken(accessToken);

			// check if token is valid then sign up the user and verify the account
			if (is_valid && signupCallback) {
				await signupCallback(is_valid);
			}

			return { jwtToken: accessToken, expiration: expires_at };
		}

		if (provider === AuthOProviders.GOOGLE) {
			// TODO: Implement login authentication for google oauth
			throw new NotFoundError("Implementation of google authentication still under construction");
		}
	}

	public async logout(): Promise<void> {
		const tokenSession = await this.store.get(generalConstants.tokenRedisKey);

		if (tokenSession) {
			await this.store.del(generalConstants.tokenRedisKey);
		}

		this.authenticated = false;
	}

	private static async getFacebookLoginUser(accessToken: string)
	: Promise<IFacebookUserCredentials> {
		const { user_id, is_valid } = await UserUtilities.debugFacebookAccessToken(accessToken);
		if (!is_valid) {
			throw new BadRequestError(authErrorConstants.invalidFacebookAccessToken);
		}
		// eslint-disable-next-line no-case-declarations
		return await UserUtilities.findFacebookUserCredentials(user_id, accessToken);
	}

	private async getSocialMediaLoginUser(accessToken: string, provider: string)
	: Promise<ISocialMediaTokenPayload<IFacebookUserCredentials>> {
		let user: ISocialMediaTokenPayload<IFacebookUserCredentials>;

		switch (provider) {
			case AuthOProviders.FACEBOOK:
				// eslint-disable-next-line no-case-declarations
				const facebookUser = await UserAuthentication.getFacebookLoginUser(accessToken);
				user = {
					verified: true,
					role: Roles.rider,
					payload: facebookUser
				};
				break;
			case AuthOProviders.GOOGLE:
				// TODO: Implement login authorization for google oauth
				throw new NotFoundError("Google authorization has not been implemented yet");
			default:
				throw new BadRequestError(authErrorConstants.invalidProvider);
		}

		return user;
	}

	public async getLocalCurrentUser(req: Request): Promise<JwtPayload | IAuthError> {
		const jwtSecret = process.env.JWT_SECRET;
		const bufferSecret = Buffer.from(jwtSecret, "base64");
		const tokenSession = await this.store.get(generalConstants.tokenRedisKey);

		const authHeader = req && req.headers ? req.headers.authorization : null;
		if (!authHeader) {
			return {
				authError: {
					message: authErrorConstants.headerMissing,
					code: AuthErrorCodes.missingHeader
				}
			} as IAuthError;
		}

		const authToken = authHeader.replace("Bearer ", "").trim();
		if (authToken !== JSON.parse(tokenSession)?.jwtToken) {
			logger.error("The token does not match the token stored in the session");
			return {
				authError: {
					message: authErrorConstants.invalidToken,
					code: AuthErrorCodes.invalidToken
				}
			} as IAuthError;
		}
		const user = await jwt.verify(authToken, bufferSecret, { algorithms:
			[HashAndEncodeAlgorithms.hs256] });

		return user as JwtPayload;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async graphGuard(context: IContextStore, done: any, permittedRoles
	: Roles[] = []) {
		const currentUser = context.user;
		await UserUtilities.authorizeUser(currentUser, permittedRoles);

		return done(currentUser);
	}

	public get currentUserToken(): ILoginToken {
		return this.currentToken;
	}

	public get isAuthenticated(): boolean {
		return this.authenticated;
	}

}

export { UserAuthentication };

import { UserAuthentication } from "../utils/userAuth.util";
import { Request, Response, NextFunction } from "express";
import { Redis } from "ioredis";
import { Roles } from "../enums";
import { UserUtilities } from "../utils/users.util";
import {AdminServices} from "../services/user/admin.svc";
import {JwtPayload} from "jsonwebtoken";
import generalConstants from "../utils/constants/general.const";

class RestAuthorization {
	private static adminServices = new AdminServices();

	public static isLoggedIn(store: Redis, permittedRoles: Roles[] = []) {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const redirected = !!(req.query?.redirected as string);
				const accessToken = req.query?.access_token;
				const totpToken = req.query?.totp_token;

				if (redirected && accessToken && totpToken) {
					req.headers.authorization= `Bearer ${accessToken}`;
					req.query.totp_token = totpToken;
				}

				const userAuthentication = new UserAuthentication({ store });
				const currentUser = await userAuthentication.getLocalCurrentUser(req);
				await UserUtilities.authorizeUser(currentUser, permittedRoles);

				req.user = currentUser;
				return next();
			} catch (err) {
				return next(err);
			}
		};
	}

	public static isMfaEnabled() {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const user = req.user as JwtPayload;
				const mfaEnabled = await this.adminServices.isMfaEnabled(user.id);

				if (!mfaEnabled) {
					return res.redirect(307,
						`${generalConstants.enableMfaRoute}?redirected=true&redirect_url=${generalConstants.oneTimePassword.signupRoute}`);
				}

				return next();
			} catch (err) {
				return next(err);
			}
		};
	}
}

export { RestAuthorization };

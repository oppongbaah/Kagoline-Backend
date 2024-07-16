import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import connectRedis from "connect-redis";
import passport from "passport";
import generalConstants from "../utils/constants/general.const";
import PassportAuthO from "../extensions/passport.ext";
import { Redis } from "ioredis";
import { UserAuthentication } from "../utils/userAuth.util";
import expressGlobalErrorHandler from "../middleware/express.errorHandler.global";
import { RestAuthorization } from "../middleware/restAuthorization";
import { AccountController } from "../controllers/account.controller";
import { Roles } from "../enums";
import dotenv from "dotenv";

dotenv.config();
const RedisStore = connectRedis(session);

class ApolloApplication extends PassportAuthO {
	private app = express();

	// controllers
	private accountController = new AccountController(this.store);

	constructor(redisClient: { store: Redis }) {
		super(redisClient.store);

		// call all express middleware
		this.app.use(bodyParser.json());
		this.app.use(helmet());
		this.app.use(cors());
		this.app.use(session({
			store: new RedisStore({ client: redisClient.store }),
			secret: process.env.SESSION_SECRET,
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: false,
				httpOnly: false,
				maxAge: parseInt(process.env.COOKIES_EXP) // in milliseconds
			},
		}));

		// call all user defined middleware
		this.confirmAccountEmail();
		this.configurePassportAuthO();
		this.configureOTPAuthentication();

		this.handleErrors();
	}

	private confirmAccountEmail(): void {
		this.app.use(`${generalConstants.confirmEmailRoute}/:_id`,
			async (req: Request, res: Response, next: NextFunction) => {
				await this.accountController.verifyEmail(req, res, next);
			}
		);
	}

	private configurePassportAuthO(): void {
		// initialize all authentication methods
		this.PassportLocalStrategy();
		this.FacebookStrategy();
		this.GoogleStrategy();

		this.app.use(passport.initialize());
		this.app.use(passport.session());

		this.app.post(generalConstants.loginRoute,
			async (req: Request, res: Response, next: NextFunction) => {
				await this.accountController.login(req, res, next);
			});

		this.app.get(generalConstants.facebookAuthO2.loginRoute,
			passport.authenticate(generalConstants.facebookAuthO2.strategy)
		);

		this.app.get(generalConstants.facebookAuthO2.callbackRoute,
			passport.authenticate(generalConstants.facebookAuthO2.strategy, {
				failureRedirect: generalConstants.failureRedirectUrl,
				session: false
			}), (req: Request, res: Response) => {
				const user = UserAuthentication.encrypt(JSON.stringify(req.user));
				res.redirect(`${generalConstants.successRedirectUrl}/${user}`);
			}
		);

		this.app.get(generalConstants.googleAuthO2.loginRoute,
			passport.authenticate(generalConstants.googleAuthO2.strategy, {
				scope: generalConstants.googleAuthO2.scope
			})
		);

		this.app.get(generalConstants.googleAuthO2.callbackRoute,
			passport.authenticate(generalConstants.googleAuthO2.strategy, {
				failureRedirect: generalConstants.failureRedirectUrl
			}), (req: Request, res: Response) => {
				const user = UserAuthentication.encrypt(JSON.stringify(req.user));
				res.redirect(`${generalConstants.successRedirectUrl}/${user}`);
			}
		);

		this.app.get(`${generalConstants.successRoute}/:user`, (req: Request, res: Response) => {
			res.json({
				message: generalConstants.successMessage,
				data: UserAuthentication.decrypt(req.params.user)
			});
		});

		this.app.get(generalConstants.failureRoute, (_: Request, res: Response) => {
			res.send(generalConstants.errorMessage);
		});
	}

	private configureOTPAuthentication(): void {
		this.app.post(generalConstants.oneTimePassword.signupRoute,
			RestAuthorization.isLoggedIn(this.store, [Roles.admin]),
			RestAuthorization.isMfaEnabled(),
			async (req: Request, res: Response, next: NextFunction) => {
				await this.accountController.add2FA(req, res, next);
			}
		);

		this.app.post(generalConstants.oneTimePassword.verifyRoute,
			RestAuthorization.isLoggedIn(this.store, [Roles.admin]),
			RestAuthorization.isMfaEnabled(),
			async (req: Request, res: Response, next: NextFunction) => {
				await this.accountController.verify2FA(req, res, next);
			}
		);

		this.app.post(generalConstants.oneTimePassword.validateRoute,
			RestAuthorization.isLoggedIn(this.store, [Roles.admin]),
			RestAuthorization.isMfaEnabled(),
			async (req: Request, res: Response, next: NextFunction) => {
				await this.accountController.validateTotpToken(req, res, next);
			}
		);

		this.app.post(generalConstants.enableMfaRoute,
			RestAuthorization.isLoggedIn(this.store, [Roles.admin]),
			async (req: Request, res: Response, next: NextFunction) => {
				await this.accountController.enableMfa(req, res, next);
			}
		);

		this.app.post(generalConstants.disableMfaRoute,
			RestAuthorization.isLoggedIn(this.store, [Roles.admin]),
			async (req: Request, res: Response, next: NextFunction) => {
				await this.accountController.disableMfa(req, res, next);
			}
		);
	}

	private handleErrors() {
		this.app.use(expressGlobalErrorHandler);
	}

	public get root() {
		return this.app;
	}
}

export default ApolloApplication;

import { IGeneralConstants } from "../../interfaces";
import { ApplicationRoutes } from "./routes";

class GeneralConstants implements IGeneralConstants {
	public static readonly applicationName = "kargoline";
	public static readonly defaultPort = 3000;
	public static readonly graphqlPort = 4000;
	public static readonly host = "http://localhost";

	public static readonly emptyString = "";
	public static readonly backSlash = "/";
	public static readonly role = "role";
	public static readonly permissions = "permissions";

	public static readonly tokenRedisKey = "token";
	public static readonly userRedisKey = "user";

	public static readonly dbSuccessMessage = "database successfully connected";
	public static readonly dbFailureMessage = "database is disconnected";

	public static readonly debugDatabase = "kargoline:database";
	public static readonly debugServer = "kargoline:server";
	public static readonly debugWorker = "kargoline:worker";
	public static readonly debugPassport = "kargoline:authentication";

	public static readonly logDebugLevel = "debug";
	public static readonly logErrorLevel = "error";
	public static readonly logTimeFormat = "MMM-DD-YYYY HH:mm:ss";
	public static readonly logDatePattern = "YYYY-MM-DD";
	public static readonly logMaxFiles = "7d";
	public static readonly logMaxSize = "1m";
	public static readonly logsFile = "application-%DATE%.log";
	public static readonly logsFolder = "logs";

	public static readonly serverBooting = "booting server...";
	public static readonly serverBooted = "server booted successfully";
	public static readonly portInUse = "Port already in use. Try again";
	public static readonly serverShutting = "server shutting down...";
	public static readonly serverListen = "listen";
	public static readonly serverListening = "listening";
	public static readonly serverClose = "close";
	public static readonly serverError = "error";
	public static readonly serverWaitTime = 1000;

	public static readonly apolloServerBooted = "Apollo server listening on 127.0.0.1:4000/kargoline";

	public static readonly homeRoute = this.backSlash;
	public static readonly graphqlRoute = this.backSlash + this.applicationName;
	public static readonly adminRoute = ApplicationRoutes.adminRoute;
	public static readonly signupRoute = ApplicationRoutes.signupRoute;
	public static readonly loginRoute = ApplicationRoutes.loginRoute;
	public static readonly enableMfaRoute = ApplicationRoutes.enableMfaRoute;
	public static readonly disableMfaRoute = ApplicationRoutes.disableMfaRoute;
	public static readonly confirmEmailRoute = ApplicationRoutes.confirmEmailRoute;

	public static readonly combined = "combined";
	public static readonly staticPath = "static";
	public static readonly asterisk = "*";
	public static readonly welcomeMessage = "Welcome to Kargoline Dashboard. Visit 127.0.0.1:4000/kargoline to access all graphql services";

	public static readonly emailVerificationError = "Email verification failed";
	public static readonly errorMessage = "fail";
	public static readonly successMessage = "success";
	public static readonly failureRoute = ApplicationRoutes.failureRoute;
	public static readonly successRoute = ApplicationRoutes.successRoute;
	public static readonly failureRedirectUrl = `${GeneralConstants.host}:${GeneralConstants.graphqlPort}${GeneralConstants.failureRoute}`;
	public static readonly successRedirectUrl =`${GeneralConstants.host}:${GeneralConstants.graphqlPort}${GeneralConstants.successRoute}`;
	public static readonly home = `${GeneralConstants.host}:${GeneralConstants.graphqlPort}/${GeneralConstants.applicationName}`;

	public static readonly facebookAuthO2 = {
		strategy: "facebook",
		loginRoute: ApplicationRoutes.facebookLoginRoute,
		callbackRoute: ApplicationRoutes.facebookCallbackRoute,
		errorMessage: "Authentication with Facebook failed",
		graphAPIBaseUrl: "https://graph.facebook.com/"
	};

	public static readonly googleAuthO2 = {
		strategy: "google",
		loginRoute: ApplicationRoutes.googleLoginRoute,
		callbackRoute: ApplicationRoutes.googleCallbackRoute,
		scope: [ "email", "profile" ]
	};

	public static readonly oneTimePassword = {
		signupRoute: ApplicationRoutes.totpRegisterRoute,
		verifyRoute: ApplicationRoutes.totpVerifyRoute,
		validateRoute: ApplicationRoutes.totpValidateRoute
	}

	public static readonly localAuthO = {
		strategy: "graphql-local"
	};

	public static readonly queueNames = {
		emailQueue: "email-queue"
	};

	public static readonly jobNames = {
		signupMailJob: "signup-verification-email",
		sendMFASuccessMessage: "mfa-setup-successful"
	};

	public static readonly verifyEmailContent = {
		subject: "Verify your email address",
		bodyText: "Click the link below to verify your email"
	};

	public static readonly totpEmailContent = {
		subject: "Setup 2FA",
		bodyText: "2FA Set up Successfully"
	};

	public static readonly productionEnv = "production";
	public static readonly developmentEnv = "development";

	public static readonly driverDiscriminator = "Driver";
	public static readonly riderDiscriminator = "Rider";
	public static readonly adminDiscriminator = "Admin";
}

export default GeneralConstants;

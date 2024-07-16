import { IValidatorErrorConstants,
	IConnectionErrorConstants,
	IExceptionErrorConstants,
	IAuthErrorConstants
} from "../../interfaces";
import { StatusText,
	Exceptions
} from "../../enums";

export const validationErrorConstants: IValidatorErrorConstants = {
	firstName: {
		required: "firstName is a required field",
		max: "firstName must be < 120 characters"
	},
	lastName: {
		required: "lastName is a required field",
		max: "lastName must be < 120 characters"
	},
	password: {
		required: "password is a required field",
		max: "password must be < 12 characters",
		min: "password must be > 8 characters"
	},
	email: {
		required:"email is a required field",
		validation: "Please provide a valid email"
	},
	license: {
		required: "license is a required field",
		max: "license must be < 50 characters"
	},
	role: {
		required: "role is a required field",
		message: "provide a valid role"
	},
	country: {
		max: "country must be < 120 characters"
	},
	gender: {
		message: "provide a valid gender"
	},
	address: {
		max: "address must be < 120 characters"
	},
	mfa: {
		message: "provide a valid authentication method"
	}
};

export const connectionErrorConstants: IConnectionErrorConstants = {
	dbConnectionError: "We couldn't establish a secured connection between the server instance and the mongodb cluster. Check your internet connection and try again",
	dbServerDisconnectError: "The mongoDB server is down"
};

export const exceptionErrorConstants: IExceptionErrorConstants = {
	fail: StatusText.fail,
	success: StatusText.ok,
	invalid: StatusText.invalid,
	duplicateKey: StatusText.duplicate,
	writeConflict: StatusText.write,
	badConfiguration: StatusText.config,
	badRequestException: Exceptions.badRequest,
	unauthorizedException: Exceptions.unauthorized,
	internalServerException: Exceptions.internalServer,
	redirectException: Exceptions.redirect,
	clientException: Exceptions.client,
	mongoDbException: Exceptions.mongo,
	validationException: Exceptions.validation,
	mongoError: "MongoError",
	internalServerErrorMessage: "Internal server error",
	notFoundErrorMessage: "Route cannot be found",
	customError: "Custom Error",
	unknownError: "Unknown Error"
};

export const authErrorConstants: IAuthErrorConstants = {
	headerMissing: "Authentication required",
	invalidToken: "Please login again",
	requiredAuth: "Authentication is required",
	unverifiedEmail: "Email address is not verified",
	unverifiedMfaAccount: "MFA account has not been verified",
	permissionDenied: "You do not have permission to visit this content",
	invalidFacebookAccessToken: "Facebook access token has expired",
	invalidProvider: "Invalid AuthO provider",
	unknownFacebookUser: "No user matched for facebook authorization",
	invalidUsernameAndPassword: "username and password cannot be empty",
	invalidUserRole: "Choose a user type to proceed",
	invalidTotpToken: "Token from the authenticator app is either invalid or expired",
	missingTotpToken: "Enter the code from the google authenticator app",
	noMfaAdded: "No mutifactor authentication has been added to your account",
	noUserMatch: "Couldn't find account. Try again with admin privileges"
};

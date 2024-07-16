import { StatusText, Exceptions } from "../../enums";

interface StringValidator {
	required?: string
	max?: string
	min?: string
}

interface EnumValidator {
	message?: string
	required?: string
}

interface EmailValidator {
	required?: string
	validation?: string
}

export interface IValidatorErrorConstants {
	firstName?: StringValidator
	lastName?: StringValidator
	password?: StringValidator
	email: EmailValidator
	license: StringValidator
	country: StringValidator
	address: StringValidator
	gender: EnumValidator
	role: EnumValidator
	mfa: EnumValidator
}

export interface IConnectionErrorConstants {
	dbConnectionError?: string
	dbServerDisconnectError?: string
}

export interface IExceptionErrorConstants {
	fail?: StatusText.fail
	success?: StatusText.ok
	invalid?: StatusText.invalid
	duplicateKey?: StatusText.duplicate
	writeConflict?: StatusText.write
	badConfiguration?: StatusText.config
	badRequestException?: Exceptions.badRequest
	unauthorizedException?: Exceptions.unauthorized
	notFOundException?: Exceptions.notFound
	internalServerException?: Exceptions.internalServer
	redirectException?: Exceptions.redirect
	mongoDbException?: Exceptions.mongo
	validationException?: Exceptions.validation
	mongoError?: string
	internalServerErrorMessage?: string
	notFoundErrorMessage?: string
	customError?: string
	clientException?: string
	unknownError?: string
}

export interface IAuthErrorConstants {
	headerMissing: string
	invalidToken: string
	requiredAuth: string
	unverifiedEmail: string
	unverifiedMfaAccount: string
	permissionDenied: string
	invalidFacebookAccessToken: string
	invalidProvider: string
	unknownFacebookUser: string
	invalidUsernameAndPassword: string
	invalidUserRole: string
	missingTotpToken: string
	noMfaAdded: string
	noUserMatch: string
	invalidTotpToken: string
}

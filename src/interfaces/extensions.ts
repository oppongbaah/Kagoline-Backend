import { AuthErrorCodes } from "../enums";

export interface IFacebookDebugData {
	app_id: string
	type: string
	application: string
	data_access_expires_at: Date
	expires_at: Date
	is_valid: boolean
	issued_at: Date
	scopes: string[]
	user_id: string
}

export interface IOPTAuthSecret {
	otpAuthUrl : string,
	base32: string,
}

export interface IAuthErrorData {
	message: string
	code: AuthErrorCodes
}

export interface IFacebookUserCredentials {
	name: string
	id: string
	email: string
}

export interface ISocialMediaTokenPayload<T> {
	role: string
	verified: boolean
	payload: T
}

export interface IAuthError {
	authError: IAuthErrorData
}

export type FacebookVerifyCallback<error = unknown, user extends object = object, info = unknown> =
		(error: error, user?: user, info?: info) => void;

export type SignupCallback<valid = boolean> = (validToken: valid) => Promise<void>

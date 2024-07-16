import { ILoginResponseRawUserData,IUserResponseRawData } from "./response.int";
import { Types , Document} from "mongoose";
import { Gender, Roles, MFAs } from "../../../enums";
import { Redis } from "ioredis";

export interface ILoginCredentials {
	email: string
	password: string
	role?: string
	permissions?: string[]
}

export interface ICheckUser {
	exist: boolean
	payload: ILoginResponseRawUserData | IUserResponseRawData
}

export interface IUserExistFilter {
	email: string
	role?: string
}

export interface IUserAccessAndHashTokens {
	accessToken: string
	hashedToken: string
}

interface IMultiFactorAuthentication {
	method: MFAs
	temp_secret: string
	secret: string
	verified: boolean
}

export interface IUserRequestModelData extends Document {
	firstName: string
	lastName: string
	password: string
	email: string
	license: string
	role: Roles | string
	joinedDate?: string
	dateOfBirth?: Date
	country?: string
	contact?: number
	gender?: Gender
	trucks?: Types.ObjectId
	trips?: Types.ObjectId
	address?: string
	fullname?: string
	username?: string
	multiFactorAuthentication?: IMultiFactorAuthentication[]
}

export interface ISignupUserArgs {
	user: IUserRequestModelData
}

export interface ILoginUserArgs {
	credentials: ILoginCredentials
}

export interface ISocialMediaAuthorizationArgs {
	credentials: {
		accessToken: string
		provider: string
	}
}

type socialLoginRole = | "rider"

export interface IUserSignupInput {
	firstName: string
	lastName: string
	email: string
	role: Roles | string
}

export interface IUserSocialSignupInput {
	firstName: string
	lastName: string
	email: string
	role: socialLoginRole,
	verified: boolean
	facebook?: { accessToken: string }
	google?: { accessToken: string }
}

export interface IAuthOptions {
	store: Redis
}

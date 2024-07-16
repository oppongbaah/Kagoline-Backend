import { Types } from "mongoose";
import { Gender } from "../../../enums";
import { IAuthErrorData } from "../../extensions";

export interface IUserResponseRawData {
	_id?: string
	id?: string
	__v?: number
	firstName: string
	lastName: string
	password: string
	email: string
	license: string
	joinedDate?: string
	dateOfBirth?: Date
	country?: string
	contact?: number
	gender?: Gender
	trucks?: Types.ObjectId
	trips?: Types.ObjectId
	address?: string
	role: string
	fullname?: string
	username?: string
	authError?: IAuthErrorData
	verified?: boolean
}

export interface ILoginToken {
	jwtToken: string
	expiration: Date
}

export interface ISignupResponseData {
	username: string
	token: ILoginToken
}

export interface ILoginResponseData {
	username?: string
	email: string,
	fullname?: string
	role?: string
	accessToken?: ILoginToken,
	provider?: string,
	message?: string
}

export interface ILoginResponseRawUserData {
	_id: string
	id?: string
	username: string
	email: string,
	fullname: string
	role: string
	password?: string
	verified?: boolean
}

export interface IUpdateResponse {
	n: number,
	nModified: number,
	ok: number
}

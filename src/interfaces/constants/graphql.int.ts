export interface ISignupMutationConstants {
	alreadyExistMessage?: string
	nullUserData?: string
}

export interface IDateScalarConstants {
	name?: string
	description?: string
}

export interface ILoginUserConstants {
	wrongCredentials: string
	noMatch: string
}

export interface IGraphQLConstants {
	mutations?: {
		signupUser?: ISignupMutationConstants
		loginUser?: ILoginUserConstants
	}
	scalar?: {
		date?: IDateScalarConstants
	}
}

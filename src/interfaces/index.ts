import { PassportContext, AuthInfoTemplate } from "graphql-passport";
import { Request } from "express";
import { IUserResponseRawData } from "./data/users/response.int";
import { ILoginCredentials } from "./data/users/request.int";
import { Redis } from "ioredis";

export { IUserRequestModelData,
	ICheckUser,
	IUserAccessAndHashTokens,
	IUserExistFilter,
	ISignupUserArgs,
	ILoginUserArgs,
	IUserSignupInput,
	IUserSocialSignupInput,
	IAuthOptions,
	ILoginCredentials,
	ISocialMediaAuthorizationArgs
} from "./data/users/request.int";
export { ILoginResponseData,
	ISignupResponseData,
	ILoginToken,
	IUserResponseRawData,
	ILoginResponseRawUserData,
	IUpdateResponse
} from "./data/users/response.int";
export { IErrorData, IErrorNoException
} from "./errorData.int";
export { IGeneralConstants
} from "./constants/general.int";
export { IModelConstants
} from "./constants/models.int";
export { IValidatorErrorConstants,
	IConnectionErrorConstants,
	IExceptionErrorConstants,
	IAuthErrorConstants
} from "./constants/error.int";
export { IGraphQLConstants,
	ISignupMutationConstants,
	IDateScalarConstants,
	ILoginUserConstants } from "./constants/graphql.int";
export type IContextStore = PassportContext<IUserResponseRawData,
	ILoginCredentials, AuthInfoTemplate, Request, Redis>
export { IFacebookDebugData,
	IOPTAuthSecret,
	ISocialMediaTokenPayload,
	IAuthError,
	IFacebookUserCredentials,
	FacebookVerifyCallback,
	SignupCallback
} from "./extensions";

export { ITruckModelData } from "./data/truck/request.int";
export { ITruckResponseData } from "./data/truck/response.int";

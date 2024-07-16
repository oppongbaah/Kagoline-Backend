import generalConstants from "./constants/general.const";
import { authErrorConstants } from "./constants/error.const";
import { IUserResponseRawData,
	IUserRequestModelData,
	ILoginToken,
	ILoginResponseRawUserData,
	IUserSocialSignupInput,
	ILoginResponseData,
	IFacebookDebugData,
	IFacebookUserCredentials,
	IAuthError,
	ICheckUser
} from "../interfaces";
import { HttpMethods, StatusCodes, Roles } from "../enums";
import { AxiosResponse } from "axios";
import { BadRequestError } from "../errors/client";
import { AxiosExt } from "../extensions/axios.ext";
import { JwtPayload } from "jsonwebtoken";
import { UserServices } from "../services/user/user.svc";
import { AdminServices } from "../services/user/admin.svc";
import { DriverServices } from "../services/user/driver.svc";
import { RiderServices } from "../services/user/rider.svc";

class UserUtilities {
	private riderServices = new RiderServices();
	private driverServices = new DriverServices();
	private adminServices = new AdminServices();

	public static generateUsername(firstName: string, lastName: string,
		otherNames = generalConstants.emptyString): string {
		let suffix;
		if (!otherNames) {
			suffix = lastName.slice(0, 2);
			return firstName.toLowerCase() + suffix.toLowerCase();
		}
		suffix = lastName.slice(0, 1) + otherNames.slice(0, 1);

		return firstName.toLowerCase() + suffix.toLowerCase();
	}

	public static getFullName(firstName: string, lastName: string,
		otherNames = generalConstants.emptyString): string {
		if (!otherNames) {
			return `${firstName} ${lastName}`;
		}

		return `${firstName} ${otherNames} ${lastName}`;
	}

	public static formatRole(role: string): string {
		let formattedRole = "";

		switch (role.toUpperCase()) {
			case Roles.admin:
				formattedRole = Roles.admin;
				break;
			case Roles.driver:
				formattedRole = Roles.driver;
				break;
			case Roles.rider:
				formattedRole = Roles.rider;
				break;
			default:
				break;
		}
		return formattedRole;
	}

	public async checkUserExistenceWithPayload(email: string, role: string)
	: Promise<ICheckUser> {
		let user: ICheckUser;

		switch(role) {
			case Roles.rider.toLowerCase():
				user = await this.riderServices.riderExist(email);
				break;
			case Roles.driver.toLowerCase():
				user = await this.driverServices.driverExist(email);
				break;
			case Roles.admin.toLowerCase():
				user = await this.adminServices.adminExist(email);
				break;
			default:
				break;
		}

		return user;
	}

	public async saveUserData(user: IUserRequestModelData)
	: Promise<IUserResponseRawData> {
		let userResponse: IUserResponseRawData;
		switch(user.role) {
			case Roles.rider.toLowerCase():
				userResponse = await this.riderServices.saveOne(user);
				break;
			case Roles.driver.toLowerCase():
				userResponse = await this.driverServices.saveOne(user);
				break;
			case Roles.admin.toLowerCase():
				userResponse = await this.adminServices.saveOne(user);
				break;
			default:
				break;
		}

		return userResponse;
	}

	public static mapUserSignupResponse(user: IUserResponseRawData | ILoginResponseRawUserData,
		token: ILoginToken, provider: string) : ILoginResponseData {
		return {
			username: user?.username,
			fullname: user?.fullname,
			email: user.email,
			role: user?.role,
			accessToken: token,
			provider
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static decorateProfileDataForFacebookSignup(user: any, accessToken: string)
		: IUserSocialSignupInput {
		return {
			email: user.email,
			firstName: user.first_name,
			lastName: user.last_name,
			role: "rider",
			verified: false,
			facebook: { accessToken }
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static decorateProfileDataForGoogleSignup(user: any, accessToken: string)
		: IUserSocialSignupInput {
		return {
			email: user.email,
			firstName: user.given_name,
			lastName: user.family_name,
			role: "rider",
			verified: false,
			google: { accessToken }
		};
	}

	public static async debugFacebookAccessToken(accessToken: string): Promise<IFacebookDebugData> {
		const basePath = generalConstants.facebookAuthO2.graphAPIBaseUrl;
		const path = `${process.env.FACEBOOK_API_VERSION}/debug_token`;
		const params = {
			input_token: accessToken,
			access_token: accessToken
		};

		const response: AxiosResponse = await AxiosExt.call(basePath, path, HttpMethods.GET, params);
		if (!response || response.status !== StatusCodes.OK) {
			throw new BadRequestError(authErrorConstants.unknownFacebookUser);
		}

		return response.data.data;
	}

	public static async findFacebookUserCredentials(userID: string, accessToken: string)
	: Promise<IFacebookUserCredentials> {
		const basePath = generalConstants.facebookAuthO2.graphAPIBaseUrl;
		const path = `${process.env.FACEBOOK_API_VERSION}/${userID}`;
		const params = {
			fields: "id, name, email",
			access_token: accessToken
		};

		const response: AxiosResponse = await AxiosExt.call(basePath, path, HttpMethods.GET, params);
		if (!response || response.status !== StatusCodes.OK) {
			throw new BadRequestError(authErrorConstants.unknownFacebookUser);
		}

		return response.data;
	}

	public static async authorizeUser(currentUser: JwtPayload | IAuthError, permittedRoles: string[])
	: Promise<void> {
		const userServices = new UserServices();
		if (!currentUser) {
			throw new BadRequestError(authErrorConstants.requiredAuth);
		}

		if (currentUser.authError) {
			throw new BadRequestError(currentUser.authError.message);
		}

		currentUser = currentUser as JwtPayload;
		const verified = await userServices.checkVerificationStatus(currentUser.id);

		if (!verified) {
			throw new BadRequestError(authErrorConstants.unverifiedEmail);
		}

		if (permittedRoles && permittedRoles.length) {
			const permitted = permittedRoles.includes(currentUser.role);
			if (!permitted) {
				throw new BadRequestError(authErrorConstants.permissionDenied);
			}
		}
	}
}

export { UserUtilities };

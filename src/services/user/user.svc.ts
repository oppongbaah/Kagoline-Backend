import { UserModel } from "../../models";
import { IUserResponseRawData,
	ICheckUser } from "../../interfaces";
import { Roles } from "../../enums";
import { QueryServices } from "../query.svc";
import { UserAuthentication } from "../../utils/userAuth.util";

class UserServices extends QueryServices {
	constructor() {
		super(UserModel);
	}

	public async findAll(): Promise<IUserResponseRawData[]> {
		return this.fetchAll();
	}

	public async userExist(email: string, role: Roles
		| string = Roles.empty) : Promise<ICheckUser> {
		return this.userExist(email, role);
	}

	public async saveVerificationToken(id: string, accessToken: string): Promise<void> {
		return this.updateOneById(id, { verifyToken: accessToken, verified: false });
	}

	public async verifyEmail(id: string, token: string): Promise<boolean> {
		const user = await this.fetchById(id, "verifyToken verified");

		if (!user) {
			throw new Error("Account does not exist");
		}

		if (user.verified) return true;
		const canVerify = await UserAuthentication.checkAccessToken(token, user.verifyToken);
		if (canVerify) {
			await this.updateOneById(id, { verifyToken: "", verified: true });
			return true;
		}

		return false;
	}

	public async checkVerificationStatus(id: string): Promise<boolean> {
		const user = await this.fetchById(id, "verified");

		if (!user) {
			throw new Error("Account does not exist");
		}

		return user.verified;
	}

	public async getSocialTokenHolder() {
		//
	}
}

export { UserServices };

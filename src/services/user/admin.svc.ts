import { AdminModel } from "../../models";
import { IUserResponseRawData,
	ICheckUser,
	IUpdateResponse,
	IUserSignupInput } from "../../interfaces";
import { Roles, MFAs } from "../../enums";
import { QueryServices } from "../query.svc";
import { Unauthorized as UnauthorizedError } from "../../errors/client";
import { authErrorConstants } from "../../utils/constants/error.const";

class AdminServices extends QueryServices {
	constructor() {
		super(AdminModel);
	}

	public async findAll(): Promise<IUserResponseRawData[]> {
		return this.fetchAll<IUserResponseRawData>();
	}

	public async saveOne(userData: IUserSignupInput)
	:Promise<IUserResponseRawData> {
		const response = await this.push<IUserSignupInput, IUserResponseRawData>([userData]);
		return response[0];
	}

	public async adminExist(email: string, role: Roles | string = Roles.empty)
	: Promise<ICheckUser> {
		return this.userExist(email, role);
	}

	public async addTwoFA(uid: string, secret: string, method: string = MFAs.googleAuth)
	: Promise<IUpdateResponse> {
		const user = await this.fetchById(uid);

		if (!user) {
			return { n: 0, nModified: 0, ok: 0 };
		}

		if (!user.multiFactorAuthentications?.length) {
			await this.updateOneById(uid, {
				"$push": {
					multiFactorAuthentications: {
						method,
						tempSecret: secret,
						secret: "",
						verified: false
					}
				}
			});
			return { n: 1, nModified: 1, ok: 1 };
		}

		const filter = {
			multiFactorAuthentications: {
				"$not": {
					"$elemMatch": {
						"method": MFAs.googleAuth
					}
				}
			}
		};
		const update = {
			"$push": {
				"multiFactorAuthentications.$.method": method,
				"multiFactorAuthentications.$.tempSecret": secret,
				"multiFactorAuthentications.$.verified": false,
			}
		};

		return this.updateOneByAny(filter, update);
	}

	public async addTwoFaPermanentSecret(tempSecret: string): Promise<IUpdateResponse> {
		const filter = {
			multiFactorAuthentications: {
				"$elemMatch": {
					"method": MFAs.googleAuth
				}
			}
		};
		const update = {
			"$set": {
				"multiFactorAuthentications.$.secret": tempSecret,
				"multiFactorAuthentications.$.verified": true,
				"multiFactorAuthentications.$.tempSecret": "",
			}
		};

		return this.updateOneByAny(filter, update);
	}

	public async getTwoFaSecret(uid: string, method: string = MFAs.googleAuth)
		: Promise<string> {
		const mfaAttr = "secret";
		return await this.getMfaAttribute(mfaAttr, uid, method) as string;
	}

	public async getTwoFaTemporalSecret(id: string, method: string = MFAs.googleAuth)
		: Promise<string> {
		const mfaAttr = "tempSecret";
		return await this.getMfaAttribute(mfaAttr, id, method) as string;
	}

	public async checkTwoFaVerificationStatus(id: string, method: string = MFAs.googleAuth)
		: Promise<boolean> {
		const mfaAttr = "verified";
		return await this.getMfaAttribute(mfaAttr, id, method) as boolean;
	}

	private async getMfaAttribute(attribute: string, id: string, method: string)
		: Promise<string | boolean> {
		const user = await this.fetchById(id);
		let response: string | boolean;

		if (!user) {
			throw new UnauthorizedError(authErrorConstants.noUserMatch);
		}

		if (!user.multiFactorAuthentications.length) {
			throw new UnauthorizedError(authErrorConstants.noMfaAdded);
		}

		for (const mfa of user.multiFactorAuthentications) {
			if (mfa.method === method) {
				response = mfa[attribute];
				break;
			}
		}

		return response;
	}

	public async enableMfa(id: string): Promise<void> {
		const response: IUpdateResponse = await this.toggleUserMfa(id, true);
		if (response.ok && !response.nModified) {
			throw new UnauthorizedError(authErrorConstants.noUserMatch);
		}
	}

	public async disableMfa(id: string): Promise<void> {
		const response: IUpdateResponse = await this.toggleUserMfa(id, false);
		if (response.ok && !response.nModified) {
			throw new UnauthorizedError(authErrorConstants.noUserMatch);
		}
	}

	public async isMfaEnabled(id: string): Promise<boolean> {
		const user = await this.fetchById(id);

		if (!user) {
			throw new UnauthorizedError(authErrorConstants.noUserMatch);
		}

		return user.mfaEnabled;
	}

	private async toggleUserMfa(id: string, value: boolean): Promise<IUpdateResponse> {
		const updatedUser = this.updateOneById(id, { mfaEnabled: value });

		if (!updatedUser) {
			return { n: 0, nModified: 0, ok: 1 };
		}

		return { n: 1, nModified: 1, ok: 1 };
	}
}

export { AdminServices };

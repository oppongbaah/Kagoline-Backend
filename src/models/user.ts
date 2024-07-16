// This must be a readonly model

import { model, Model } from "mongoose";
import { IUserRequestModelData } from "../interfaces";
import { modelConstants } from "../utils/constants/model.const";
import logger from "../extensions/logger";
import { UserSchema } from "./schema/user.schema";

let UserModel: Model<IUserRequestModelData>;

try {
	UserModel = model<IUserRequestModelData>(
		modelConstants.collections.users,
		UserSchema);
} catch (err) {
	logger.error(err.message);
}

export { UserModel };

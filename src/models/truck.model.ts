import { model, Model } from "mongoose";
import { ITruckModelData } from "../interfaces";
import { modelConstants } from "../utils/constants/model.const";
import logger from "../extensions/logger";
import { TruckSchema } from "./schema/truck.schema";

let TruckModel: Model<ITruckModelData>;

try {
	TruckModel = model<ITruckModelData>(
		modelConstants.collections.trucks,
		TruckSchema);
} catch (err) {
	logger.error(err.message);
}

export { TruckModel };

import { Schema, HookNextFunction } from "mongoose";
import { ITruckModelData, ITruckResponseData } from "../../interfaces";
import { truckSchemaValidator } from "../../validators";
import { TruckUtilities } from "../../utils/truck.util";

const TruckSchema: Schema<ITruckModelData> =
	new Schema(truckSchemaValidator, {
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	});

// Middleware hooks
TruckSchema.post("find", async function (document: ITruckResponseData[], next: HookNextFunction) {
	if(!document) return next();

	document.map(doc => {
		doc.category = TruckUtilities.decorateTruckCategory(doc.category);
		return doc;
	});

	next();
});

TruckSchema.post("findOne", async function (document: ITruckResponseData, next: HookNextFunction) {
	if(!document.category) return next();

	document.category = TruckUtilities.decorateTruckCategory(document.category);

	next();
});

export { TruckSchema };

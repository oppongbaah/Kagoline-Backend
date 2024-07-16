import { Schema, HookNextFunction } from "mongoose";
import { IUserRequestModelData } from "../../interfaces";
import { modelConstants } from "../../utils/constants/model.const";
import { UserAuthentication } from "../../utils/userAuth.util";
import { riderSchemaValidation } from "../../validators";

const RiderSchema: Schema<IUserRequestModelData> =
	new Schema(riderSchemaValidation, {
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	});

// Middleware hooks
RiderSchema.pre("save", async function (next: HookNextFunction) {
	if (!this.password || !this.isModified("password")) return next();
	const hashCodes = [this.password, this.email];
	this.password = await UserAuthentication.hashAccessToken(hashCodes.join(""));
	next();
});

// @TODO: Establish a schema for Trucks and Trips and uncomment code

// Populate virtual types with middleware hooks
// RiderSchema.pre("findOne", function (next: HookNextFunction) {
// 	this.populate({
// 		path: modelConstants.virtualFields.trips,
// 	});
// 	next();
// });

// @TODO: Create the Truck abd Trip fields

// Virtual types
RiderSchema.virtual(modelConstants.virtualFields.trips, {
	ref: modelConstants.collections.trips,
	localField: modelConstants.localFields.trips,
	foreignField: modelConstants.foreignFields.id,
});

export { RiderSchema };

import { Schema, HookNextFunction } from "mongoose";
import { IUserRequestModelData } from "../../interfaces";
import { modelConstants } from "../../utils/constants/model.const";
import { UserAuthentication } from "../../utils/userAuth.util";
import { driverSchemaValidation } from "../../validators";

const DriverSchema: Schema<IUserRequestModelData> =
	new Schema(driverSchemaValidation, {
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	});

// Middleware hooks
DriverSchema.pre("save", async function (next: HookNextFunction) {
	if (!this.password || !this.isModified("password")) return next();
	const hashCodes = [this.password, this.email];
	this.password = await UserAuthentication.hashAccessToken(hashCodes.join(""));
	next();
});

// @TODO: Establish a schema for Trucks and Trips and uncomment code

// Populate virtual types with middleware hooks
// DriverSchema.pre("findOne", function (next: HookNextFunction) {
// 	this.populate({
// 		path: modelConstants.virtualFields.trips,
// 	});
// 	next();
// });

// DriverSchema.pre("find", function (next: HookNextFunction) {
// 	this.populate({
// 		path: modelConstants.virtualFields.trucks
// 	});
// 	next();
// });

// @TODO: Create the Truck and Trip fields

// Virtual types
DriverSchema.virtual(modelConstants.virtualFields.trucks, {
	ref: modelConstants.collections.trucks,
	localField: modelConstants.localFields.trucks,
	foreignField: modelConstants.foreignFields.id,
});

DriverSchema.virtual(modelConstants.virtualFields.trips, {
	ref: modelConstants.collections.trips,
	localField: modelConstants.localFields.trips,
	foreignField: modelConstants.foreignFields.id,
});

export { DriverSchema };

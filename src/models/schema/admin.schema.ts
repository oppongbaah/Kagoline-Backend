import { Schema, HookNextFunction } from "mongoose";
import { IUserRequestModelData } from "../../interfaces";
import { UserAuthentication } from "../../utils/userAuth.util";
import { adminSchemaValidation } from "../../validators";

const AdminSchema: Schema<IUserRequestModelData> =
	new Schema(adminSchemaValidation, {
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	});

// Middleware hooks
AdminSchema.pre("save", async function (next: HookNextFunction) {
	if (!this.password || !this.isModified("password")) return next();
	const hashCodes = [this.password, this.email];
	this.password = await UserAuthentication.hashAccessToken(hashCodes.join(""));
	next();
});

export { AdminSchema };

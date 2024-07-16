import { Schema, HookNextFunction } from "mongoose";
import { IUserRequestModelData } from "../../interfaces";
import { modelConstants } from "../../utils/constants/model.const";
import { UserUtilities } from "../../utils/users.util";
import { userSchemaValidation } from "../../validators";

const UserSchema: Schema<IUserRequestModelData> =
	new Schema(userSchemaValidation, {
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	});

// Middleware hooks
UserSchema.pre("validate", function (next: HookNextFunction) {
	if(!this.role) return next();
	this.role = UserUtilities.formatRole(this.role);
	next();
});

// Virtual fields
UserSchema.virtual(modelConstants.virtualFields.username)
	.get(function () {
		const self = this as IUserRequestModelData;
		return UserUtilities.generateUsername(self.firstName, self.lastName);
	});

UserSchema.virtual(modelConstants.virtualFields.fullname)
	.get(function () {
		const self = this as IUserRequestModelData;
		return UserUtilities.getFullName(self.firstName, self.lastName);
	});

export { UserSchema };

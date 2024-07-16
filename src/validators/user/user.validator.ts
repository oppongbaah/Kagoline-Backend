import { validationErrorConstants as validationError } from "../../utils/constants/error.const";
import isEmail from "validator/lib/isEmail";
import { Roles } from "../../enums";

export const userSchemaValidation = {
	firstName: {
		type: String,
		required: [true, validationError.firstName.required],
		maxwidth: [120, validationError.firstName.max],
		trim: true,
	},
	lastName: {
		type: String,
		required: [true, validationError.lastName.required],
		maxwidth: [120, validationError.lastName.max],
		trim: true,
	},
	email: {
		type: String,
		required: [true, validationError.email.required],
		trim: true,
		unique: true,
		validate: [isEmail, validationError.email.validation]
	},
	role: {
		type: String,
		required: [true, validationError.role.required],
		enum: {
			values: [Roles.admin, Roles.driver, Roles.rider],
			message: validationError.role.message
		}
	},
	verifyToken: {
		type: String
	},
	verified: {
		type: Boolean,
		default: false
	},
	joinedDate: {
		type: Date,
		default: Date.now()
	}
};

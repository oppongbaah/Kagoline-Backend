import { validationErrorConstants as validationError } from "../../utils/constants/error.const";
import { MFAs } from "../../enums";

const adminSchemaValidation = {
	password: {
		type: String,
		required: [true, validationError.password.required],
		minwidth: [8, validationError.password.min],
		maxwidth: [12, validationError.password.max],
		trim: true
	},
	mfaEnabled: {
		type: Boolean,
		default: false
	},
	multiFactorAuthentications: [{
		method: {
			type: String,
			enum: {
				values: [MFAs.googleAuth, MFAs.phoneAuth, MFAs.email],
				message: validationError.mfa.message
			}
		},
		tempSecret: String,
		secret: String,
		verified: Boolean
	}]
};

export { adminSchemaValidation };

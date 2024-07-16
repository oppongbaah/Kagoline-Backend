import { Schema } from "mongoose";
import { validationErrorConstants as validationError } from "../../utils/constants/error.const";
import { modelConstants } from "../../utils/constants/model.const";

const riderSchemaValidation = {
	password: {
		type: String,
		minwidth: [8, validationError.password.min],
		maxwidth: [12, validationError.password.max],
		trim: true
	},
	facebook: {
		accessToken: String
	},
	google: {
		accessToken: String
	},
	dateOfBirth: {
		type: Date
	},
	country: {
		type: String,
		maxwidth: [120, validationError.country.max],
		trim: true,
		lowercase: true
	},
	contact: {
		type: String,
		maxwidth: [15, validationError.country.max],
		trim: true,
	},
	tripsId: [{
		type: Schema.Types.ObjectId,
		required: true, ref: modelConstants.collections.trips
	}]
};

export { riderSchemaValidation };

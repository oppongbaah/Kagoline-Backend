import { Schema } from "mongoose";
import { validationErrorConstants as validationError } from "../../utils/constants/error.const";
import { modelConstants } from "../../utils/constants/model.const";
import { Gender } from "../../enums";

const driverSchemaValidation = {
	password: {
		type: String,
		required: [true, validationError.password.required],
		minwidth: [8, validationError.password.min],
		maxwidth: [12, validationError.password.max],
		trim: true
	},
	license: {
		type: String,
		required: [false, validationError.license.required],
		maxwidth: [50, validationError.license.max],
		trim: true,
		lowercase: true
	},
	joinedDate: {
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
	gender: {
		type: String,
		enum: {
			values: [Gender.male, Gender.female, Gender.other],
			message: validationError.gender.message
		}
	},
	address: {
		type: String,
		maxwidth: [120, validationError.address.max],
		trim: true,
	},
	trucksId: [{
		type: Schema.Types.ObjectId, required: true,
		ref: modelConstants.collections.trucks
	}],
	tripsId: [{
		type: Schema.Types.ObjectId,
		required: true, ref: modelConstants.collections.trips
	}]
};

export { driverSchemaValidation };

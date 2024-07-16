export const tripSchemaValidation = {
	requestTime: {
		type: Date,
		required: [true, "Provide the time the ride was requested"]
	},
	waitTime: {
		type: Date,
		required: true
	},
	startTime: {
		type: Date,
		default: Date.now()
	},
	endTime: {
		type: Date,
		required: [true, "Provide the time the ride ended"]
	},
	riderRating: {
		type: Number,
		enum: {
			values: [1, 2, 3, 4, 5],
			message: "Provide a valid rating"
		}
	},
	driverRating: {
		type: Number,
		enum: {
			values: [1, 2, 3, 4, 5],
			message: "Provide a valid rating"
		}
	}
};

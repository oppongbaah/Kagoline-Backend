export const truckSchemaValidator = {
	regNo: {
		type: String,
		required: [true, "Truck's registration number is a required field"],
		trim: true
	},
	brand: {
		type: String,
		required: [true, "Truck's brand name is a required field"]
	},
	modelNo: {
		type: String,
		required: [true, "Truck's model number is a required field"]
	},
	category: {
		type: String,
		enum: {
			values: ["A", "B", "C"],
			message: "Provide a valid truck category"
		}
	}
};

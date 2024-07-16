import { IModelConstants } from "../../interfaces";

export const modelConstants: IModelConstants = {
	collections: {
		users: "User",
		trucks: "Truck",
		trips: "Trips",
		logs: "logs"
	},
	localFields: {
		trucks: "trucksId",
		trips: "tripsId"
	},
	foreignFields: {
		id: "_id"
	},
	virtualFields: {
		trucks: "trucks",
		trips: "trips",
		username: "username",
		fullname: "fullname"
	}
};

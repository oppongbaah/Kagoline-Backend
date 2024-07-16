import { TruckServices } from "../../services/truck.svc";
import { UserAuthentication } from "../../utils/userAuth.util";
import { IContextStore, ITruckModelData, ITruckResponseData } from "../../interfaces";
import { Roles } from "../../enums";
// import { BadRequestError } from "../../errors/client";
// import logger from "../../extensions/logger";

const truckServices = new TruckServices();
let userAuthentication;

const resolvers = {
	Query: {
		getTruck: async (_: unknown, args: { truckID: string }, context: IContextStore) => {
			userAuthentication = new UserAuthentication({ store: context.store });

			return userAuthentication.graphGuard(context, () => {
				return truckServices.findOne(args.truckID);
			}, [Roles.admin, Roles.driver]);
		},

		getAllTrucks: async (_: unknown, __: unknown, context: IContextStore) => {
			userAuthentication = new UserAuthentication({ store: context.store });

			return userAuthentication.graphGuard(context, () => {
				return truckServices.findAll();
			}, [Roles.admin, Roles.driver]);
		}
	},

	Mutation: {
		registerTruck: async (_: unknown, args: { truckDetails: ITruckModelData }, context
		: IContextStore): Promise<ITruckResponseData> => {
			userAuthentication = new UserAuthentication({ store: context.store });

			return userAuthentication.graphGuard(context, async () => {
				const truckDetails = args?.truckDetails;
				return truckServices.saveOne(truckDetails);
			}, [Roles.admin, Roles.driver]);
		},

		deregisterTruck: async (_: unknown, args: { truckID: string }, context: IContextStore)
		: Promise<string> => {
			userAuthentication = new UserAuthentication({ store: context.store });

			return userAuthentication.graphGuard(context, () => {
				return truckServices.removeOne(args.truckID);
			}, [Roles.admin, Roles.driver]);
		},

		changeTruckRegistrationNumber: async (_: unknown, args: { registrationDetails
		: Pick<ITruckModelData, "_id" | "regNo"> }, context: IContextStore): Promise<string> => {
			userAuthentication = new UserAuthentication({ store: context.store });
			const truckDetails = args.registrationDetails;
			const detailsToUpdate = { regNo: truckDetails.regNo };

			return userAuthentication.graphGuard(context, async () => {
				return truckServices.updateOne(truckDetails._id, detailsToUpdate);
			}, [Roles.admin, Roles.driver]);
		}
	}
};

export default resolvers;

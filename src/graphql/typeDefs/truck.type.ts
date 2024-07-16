import { gql } from "apollo-server-express";

const truckTypeDefs = gql`

	input TruckRegistrationDetails {
		regNo: String!
		brand: String!
		modelNo: String!
		category: String
	}

	input TruckRegistrationNumberDetails {
		_id: String!
		regNo: String!
	}

	type TruckResponseData {
		_id: ID!
		regNo: String!
		brand: String!
		modelNo: String!
		category: String
	}

	type TruckRegistrationNumberResponse {
		_id: ID!
		regNo: String!
		brand: String!
		modelNo: String!
	}

	extend type Query {
		getTruck(truckID: String): TruckResponseData
		getAllTrucks: [TruckResponseData]
	}

	extend type Mutation {
		registerTruck(truckDetails: TruckRegistrationDetails): TruckResponseData
		deregisterTruck(truckID: String): String!
		changeTruckRegistrationNumber(registrationDetails: TruckRegistrationNumberDetails): TruckRegistrationNumberResponse
	}
`;

export default truckTypeDefs;

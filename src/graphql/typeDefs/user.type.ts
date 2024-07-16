import { gql } from "apollo-server-express";

const userTypeDefs = gql`

	scalar Date

	type Token {
		jwtToken: String!
		expiration: Date!
	}

	type LoginResponse {
		username: String
		fullname: String
		email: String!
		role: String
		accessToken: Token
		provider: String
		message: String
	}

	type UserResponse {
		_id: ID!
		fullname: String!
		username: String!
		email: String!
		role: String!
		firstName: String!
		lastName: String!
	}

	type AccessToken {
		accessToken: String
	}

	type RiderResponse {
		_id: ID!
		fullname: String!
		username: String!
		email: String!
		role: String!
		firstName: String!
		lastName: String!
		facebook: AccessToken
		google: AccessToken
		dateOfBirth: Date
		country: String
		contact: String
		tripsId: [ID]
	}

	input SignupInput {
		firstName: String!
		lastName: String!
		password: String!
		email: String!
		role: String!
		license: String
		joinedDate: Date
		dateOfBirth: Date
		country: String
		contact: String
		gender: String
		address: String
	}

	input LoginCredentials {
		email: String!
		password: String!
		role: String!
		permissions: [String]
	}

	input SocialMediaAuthorization {
		accessToken: String!
		provider: String!
	}

	extend type Query {
		getAllUsers: [UserResponse]
		getAllRiders(credentials: SocialMediaAuthorization): [RiderResponse]
	}

	extend type Mutation {
		signupUser(user: SignupInput): LoginResponse
		loginUser(credentials: LoginCredentials): LoginResponse
	}
`;

export default userTypeDefs;

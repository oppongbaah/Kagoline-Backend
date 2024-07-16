import { IGraphQLConstants,
	ISignupMutationConstants,
	IDateScalarConstants,
	ILoginUserConstants } from "../../interfaces";

const signupUserConstant: ISignupMutationConstants = {
	alreadyExistMessage: "User with the email already exist",
	nullUserData: "No data to save"
};
const dateScalarConstants: IDateScalarConstants = {
	name: "Date",
	description: "Date custom scalar type"
};
const loginUserConstants: ILoginUserConstants = {
	wrongCredentials: "Wrong username or password",
	noMatch: "User does not exist. Sign up or double check the user credentials"
};

const graphqlConstants: IGraphQLConstants = {
	mutations: {
		signupUser: signupUserConstant,
		loginUser: loginUserConstants
	},
	scalar: {
		date: dateScalarConstants
	}
};

export { graphqlConstants };

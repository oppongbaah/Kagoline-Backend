import { BadRequestError } from "../../errors/client";
import { UserServices } from "../../services/user/user.svc";
import { RiderServices } from "../../services/user/rider.svc";
import { AdminServices } from "../../services/user/admin.svc";
import { UserAuthentication } from "../../utils/userAuth.util";
import { IUserResponseRawData,
	ILoginResponseData,
	ISignupUserArgs,
	ILoginUserArgs,
	IContextStore
} from "../../interfaces";
import { dateScalarType } from "../scalar";
import { graphqlConstants } from "../../utils/constants/graphql.const";
import generalConstants from "../../utils/constants/general.const";
import { UserUtilities } from "../../utils/users.util";
import { EmailQueuingService } from "../../services/email.svc";
import { Roles } from "../../enums";
import logger from "../../extensions/logger";

const emailQueues = new EmailQueuingService();
const userUtilities = new UserUtilities();
const userServices = new UserServices();
const riderServices = new RiderServices();
const adminServices = new AdminServices();
let userAuthentication;

const resolvers = {
	Date: dateScalarType,
	Query: {
		getAllUsers: async (_: unknown, __: unknown, context: IContextStore) => {
			userAuthentication = new UserAuthentication({ store: context.store });
			return userAuthentication.graphGuard(context, () => {
				return userServices.findAll();
			}, [Roles.admin]);
		},

		getAllRiders: async (_: unknown, __: unknown, context: IContextStore) => {
			userAuthentication = new UserAuthentication({ store: context.store });

			return userAuthentication.graphGuard(context, () => {
				return riderServices.findAll();
			}, [Roles.admin]);
		}
	},

	Mutation: {
		signupUser: async (_: unknown, args: ISignupUserArgs, context: IContextStore)
			: Promise<ILoginResponseData> => {
			const userData = args.user;
			if (!userData) {
				throw new BadRequestError(graphqlConstants.mutations.signupUser.nullUserData);
			}

			const { exist } = await userServices.userExist(userData.email, userData.role);
			const { store } = context;
			userAuthentication = new UserAuthentication({ store });

			if(exist) {
				throw new BadRequestError(graphqlConstants.mutations.signupUser.alreadyExistMessage);
			}

			const user: IUserResponseRawData = await userUtilities.saveUserData(args.user);

			const verifyToken = await userAuthentication.signup(user, (accessToken: string) => {
				userServices.saveVerificationToken(user._id, accessToken);
			});
			if (!userAuthentication.isAuthenticated) return;

			// send verification email
			await emailQueues.queue.add(
				generalConstants.jobNames.signupMailJob, {
					token: verifyToken,
					email: user.email,
					id: user._id
				});

			return UserUtilities.mapUserSignupResponse(user, userAuthentication.currentUserToken, "local");
		},

		loginUser: async (_: unknown, args: ILoginUserArgs, context: IContextStore)
		: Promise<ILoginResponseData> => {
			// This route is limited to Local logins. It does not support MFA
			const { email, password, role, permissions } = args.credentials;
			const { store, authenticate } = context;
			userAuthentication = new UserAuthentication({ store });

			// set the role which will be used for localStrategy authentication
			await store.set(generalConstants.role, role);
			// set permissions if provided
			if (permissions) await store.set(generalConstants.permissions, permissions);

			const { user } = await authenticate(generalConstants.localAuthO.strategy, { email, password});

			// check if the user is admin and MFA is enabled for the account
			if (role === Roles.admin.toLocaleLowerCase()) {
				const mfaEnabled = await adminServices.isMfaEnabled(user._id);
				if (mfaEnabled) {
					logger.error("Admin accounts with MFA enabled cannot be queried using graphql due to " +
					"security reasons. Use the {host}/login route to perform this operation");
					throw new BadRequestError("Oops! This operation cannot proceed. Contact the administrator");
				}
			}

			// clear login session
			context.req.logout();
			await userAuthentication.login(user);
			if (!userAuthentication.isAuthenticated) return;

			return UserUtilities.mapUserSignupResponse(user, userAuthentication.currentUserToken, "local");
		}
	}
};

export default resolvers;

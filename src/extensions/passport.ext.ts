import passport from "passport";
import { GraphQLLocalStrategy,
	GraphQLLocalStrategyOptionsWithRequest,
	DoneFn as LocalVerifyCallback } from "graphql-passport";
import {
	Strategy as FacebookStrategy,
	Profile,
	StrategyOptionWithRequest,
} from "passport-facebook";
import { UserServices } from "../services/user/user.svc";
import { RiderServices } from "../services/user/rider.svc";
import { BadRequestError } from "../errors/client";
import { UserAuthentication } from "../utils/userAuth.util";
import dotenv from "dotenv";
import { graphqlConstants } from "../utils/constants/graphql.const";
import {
	IUserResponseRawData,
	ILoginToken,
	ILoginResponseData,
	FacebookVerifyCallback,
	IUserSocialSignupInput
} from "../interfaces";
import generalConstants from "../utils/constants/general.const";
import { Redis } from "ioredis";
import { UserUtilities } from "../utils/users.util";
import { Request } from "express";
import { Strategy as GoogleStrategy,
	StrategyOptionsWithRequest,
	VerifyCallback as GoogleVerifyCallback } from "passport-google-oauth2";
import logger from "./logger";

dotenv.config();

abstract class PassportAuthO {
	protected store: Redis;
	protected userServices = new UserServices();
	protected riderServices = new RiderServices();
	protected userUtilities = new UserUtilities();

	protected constructor(store: Redis) {
		passport.serializeUser((user, done) => {
			done(null, user);
		});

		passport.deserializeUser((user, done) => {
			done(null, user);
		});

		this.store = store;
	}

	protected PassportLocalStrategy(): void {
		const localStrategyOptions: GraphQLLocalStrategyOptionsWithRequest = {
			passReqToCallback: true
		};

		passport.use(
			new GraphQLLocalStrategy(localStrategyOptions, async (_: unknown,
				email: string, password: string, doneCallback: LocalVerifyCallback) => {
				let error = null;

				try {
					const role = await this.store.get(generalConstants.role);
					const { exist, payload } = await this.userUtilities
						.checkUserExistenceWithPayload(email, role);

					if (!exist) {
						error = new BadRequestError(graphqlConstants.mutations.loginUser.noMatch);
						return doneCallback(error, []);
					}

					const hashCodes = [password, email];
					const isValidPassword = await UserAuthentication.checkAccessToken(hashCodes.join(""),
						payload.password);
					if (!isValidPassword) {
						error = new BadRequestError(graphqlConstants.mutations.loginUser.wrongCredentials);
						doneCallback(error, []);
					}

					doneCallback(null, payload);
				} catch (err) {
					doneCallback(err);
				}
			})
		);
	}

	protected FacebookStrategy(): void {
		const facebookStrategyOptions: StrategyOptionWithRequest = {
			clientID: process.env.FACEBOOK_CLIENT_ID,
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
			callbackURL: process.env.FACEBOOK_CALLBACK_URL,
			passReqToCallback: true,
			profileFields: ["id", "email", "name" ]
		};

		passport.use(
			new FacebookStrategy(facebookStrategyOptions, async (req: Request, accessToken: string,
				__: string, profile: Profile, doneCallback: FacebookVerifyCallback) => {
				if (!profile) return;
				const profileData = profile._json;
				const decoratedProfileData = UserUtilities.decorateProfileDataForFacebookSignup(profileData,
					accessToken);
				await this.socialAccountAuthenticator(req, decoratedProfileData, accessToken,
					profile.provider, doneCallback);
			})
		);
	}

	protected GoogleStrategy(): void {
		const googleStrategyOptions: StrategyOptionsWithRequest = {
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			passReqToCallback: true
		};

		passport.use(
			new GoogleStrategy(googleStrategyOptions, async (req: Request,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				accessToken: string, __: string, profile: any,
				doneCallback: GoogleVerifyCallback) => {
				if (!profile) return;
				const profileData = profile._json;
				const decoratedProfileData = UserUtilities.decorateProfileDataForGoogleSignup(profileData,
					accessToken);
				await this.socialAccountAuthenticator(req, decoratedProfileData, accessToken,
					profile.provider, doneCallback);
			})
		);
	}

	private async socialAccountAuthenticator(req: Request, decoratedUserData: IUserSocialSignupInput,
		accessToken: string, provider: string, doneCallback: GoogleVerifyCallback
					| FacebookVerifyCallback): Promise<void> {
		try {
			let user: IUserResponseRawData;
			let token: ILoginToken;
			const userAuthentication = new UserAuthentication({ store: this.store });
			const { exist, payload } = await this.userServices.userExist(decoratedUserData.email);

			if(!exist) {
				token = await userAuthentication.loginToSocialAccount(accessToken, provider,
					async (isValid) => {
						decoratedUserData.verified = isValid;
						user = await this.riderServices.saveOne(decoratedUserData);
					});
			} else {
				token = await userAuthentication.loginToSocialAccount(accessToken, provider);
			}

			const mappedResponseData: ILoginResponseData = UserUtilities.mapUserSignupResponse(user
				?? payload, token, provider);

			// do not return the facebook access token to the user
			delete mappedResponseData.accessToken;
			// remove password from data saved in the session
			delete payload.password;

			// clear old session data and save it again
			req.logout();
			req.login(payload, err => logger.error(err));

			return doneCallback(null, mappedResponseData);
		} catch (err) {
			doneCallback(err);
		}
	}
}

export default PassportAuthO;

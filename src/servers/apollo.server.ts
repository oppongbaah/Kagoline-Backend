/* global NodeJS */

import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";
import generalConstants from "../utils/constants/general.const";
import Debug from "debug";
import resolvers from "../graphql/resolvers";
import typeDefs from "../graphql/typeDefs";
import Database from "../config/database.config";
import apolloGlobalErrorHandler from "../middleware/apollo.errorHandler.global";
import { GraphQLFormattedError } from "graphql";
import App from "../applications/apollo.app";
import { buildContext } from "graphql-passport";
import redis from "../extensions/redis.ext";
import { UserAuthentication } from "../utils/userAuth.util";

const debug = Debug(generalConstants.debugServer);
const database = new Database();
const port = parseInt(process.env.APOLLO_SERVER_PORT)
	|| generalConstants.defaultPort;

const apollo_server = async () => {
	const redisClient = await redis.client();
	const app = new App({ store: redisClient });
	const httpServer = http.createServer(app.root);
	const userAuthentication = new UserAuthentication({ store: redisClient });

	httpServer.on(generalConstants.serverListening, () => {
		debug(generalConstants.serverBooted);
		database.start();
	});

	httpServer.on(generalConstants.serverError, (error: NodeJS.ErrnoException) => {
		if ((error).syscall === generalConstants.serverListen) {
			debug(generalConstants.portInUse);
			setTimeout(() => {
				httpServer.close();
				httpServer.listen(port);
			}, generalConstants.serverWaitTime);
		}
	});

	httpServer.on(generalConstants.serverClose, () => {
		debug(generalConstants.serverShutting);
		process.exit(0);
	});

	const apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
		context: async ({ req, res }) => buildContext({
			req,
			res,
			store: redisClient,
			user: await req.isAuthenticated()
				? req.user
				: await userAuthentication.getLocalCurrentUser(req)
		}),
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		formatError: (err): GraphQLFormattedError => {
			return apolloGlobalErrorHandler(err);
		}
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({
		app: app.root,
		path: generalConstants.graphqlRoute,
		cors: true
	});

	return new Promise((resolve, reject) => {
		httpServer.listen(port)
			.once(generalConstants.serverListening, resolve)
			.once(generalConstants.serverError, reject);
	});
};

export default apollo_server;

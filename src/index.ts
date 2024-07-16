import logger from "./extensions/logger";
import apolloServer from "./servers/apollo.server";
// import expressServer from "./servers/express.server";

(async () => {
	try {
		// start the REST API express server
		// await expressServer();

		// start the GRAPHQL apollo server
		await apolloServer();
	} catch (err) {
		logger.error(err.message);
	}
})();

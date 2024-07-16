import http from "http";
import Debug from "debug";
import app from "../applications/express.app";
import dotenv from "dotenv";
import Database from "../config/database.config";
import generalConstants from "../utils/constants/general.const";
import { ProcessCodes } from "../enums";

dotenv.config();

const debug = Debug(generalConstants.debugServer);
const port = process.env.PORT || generalConstants.defaultPort;
const httpServer = http.createServer(app.root);
const database = new Database();

const express_server = async () => {
	httpServer.on(generalConstants.serverListening, () => {
		debug(generalConstants.serverBooted);
		database.start();
	});

	httpServer.on(generalConstants.serverError,
		// eslint-disable-next-line no-undef
		(error: NodeJS.ErrnoException) => {
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
		process.exit(ProcessCodes.default);
	});

	return new Promise((resolve, reject) => {
		httpServer.listen(port)
			.once(generalConstants.serverListening, resolve)
			.once(generalConstants.serverError, reject);
	});
};

export default express_server;

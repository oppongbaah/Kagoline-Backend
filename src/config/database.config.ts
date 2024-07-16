import { connect } from "mongoose";
import Debug from "debug";
import { MONGO_URI } from "./keys.config";
import logger from "../extensions/logger";
import generalConstants from "../utils/constants/general.const";
import { connectionErrorConstants } from "../utils/constants/error.const";
import { DBConnectionErrorCodes, ProcessCodes } from "../enums";

const debug = Debug(generalConstants.debugDatabase);

class Database {
	public async start(): Promise<void> {
		const successMessage = generalConstants.dbSuccessMessage;
		const errorMessage = generalConstants.dbFailureMessage;
		try {
			await connect(MONGO_URI, {
				useCreateIndex: true,
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
			debug(successMessage);

			// Run any jobs here
		} catch (err) {
			switch(err.code) {
				case DBConnectionErrorCodes.noConnection:
					debug(connectionErrorConstants.dbConnectionError);
					break;
				case DBConnectionErrorCodes.serverDown:
					debug(connectionErrorConstants.dbServerDisconnectError);
					break;
			}

			logger.error(`${errorMessage} ${err}`);
			process.kill(process.pid, ProcessCodes.terminate);
		}
	}
}

export default Database;

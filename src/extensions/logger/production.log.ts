import winston, { format, config } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { MONGO_URI } from "../../config/keys.config";
import generalConstants from "../../utils/constants/general.const";
import { modelConstants } from "../../utils/constants/model.const";
import path from "path";
require("winston-mongodb");

const myFormat = format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);
const logFormat = format.combine(format.colorize(), format.splat(),
	format.errors({ stack: true }),
	myFormat, format.timestamp({ format: generalConstants.logTimeFormat }),
	format.align(), format.json());

const serverLogFormat = format.combine(
	format.timestamp({format: generalConstants.logTimeFormat}),format.json());

const logTransport = new DailyRotateFile({
	filename: path.join(generalConstants.logsFolder, generalConstants.logsFile),
	datePattern: generalConstants.logDatePattern,
	zippedArchive: true,
	maxSize: generalConstants.logMaxSize,
	maxFiles: generalConstants.logMaxFiles,
	format: logFormat,
	handleExceptions: true,
	json: true,
	handleRejections: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transports: any = winston.transports;

const prodLogger = () => winston.createLogger({
	levels: config.syslog.levels,
	transports: [
		logTransport,
		// MongoDB transport
		new transports.MongoDB({
			level: generalConstants.logErrorLevel,
			db: MONGO_URI,
			options: {
				useUnifiedTopology: true
			},
			collection: modelConstants.collections.logs,
			format: serverLogFormat
		})
	],
});

export default prodLogger;

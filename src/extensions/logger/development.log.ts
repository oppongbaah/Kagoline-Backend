import winston, { format, config } from "winston";
import generalConstants from "../../utils/constants/general.const";

const customFormat = format.printf(({ level, message, timestamp }) => {
	return `${level} - ${timestamp}: ${message}`;
});

const logFormat = format.combine(format.colorize(), format.splat(),
	format.errors({ stack: true }), format.align(), format.json(),
	format.timestamp({ format: generalConstants.logTimeFormat }), customFormat);

const devLogger = () => winston.createLogger({
	levels: config.syslog.levels,
	transports: [
		new winston.transports.Console({
			level: generalConstants.logDebugLevel,
			format: logFormat,
		})
	],
});

export default devLogger;

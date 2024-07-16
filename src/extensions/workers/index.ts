import EmailBackgroundWorker from "./emailWorker";
import logger from "../../extensions/logger";

(async () => {
	try {
		const emailWorker = new EmailBackgroundWorker();
		await emailWorker.doWork();
	} catch (err) {
		logger.error(err);
	}
})();

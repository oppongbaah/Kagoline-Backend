import { Queue, QueueScheduler } from "bullmq";
import IoRedis from "ioredis";
import generalConstants from "../utils/constants/general.const";

class EmailQueuingService {
	private EmailQueue = new Queue(
		generalConstants.queueNames.emailQueue, {
			connection: new IoRedis(process.env.REDIS_URL, {
				enableReadyCheck: false, maxRetriesPerRequest: null
			})
		}
	);

	private EmailQueueScheduler = new QueueScheduler(
		generalConstants.queueNames.emailQueue, {
			connection: new IoRedis(process.env.REDIS_URL, {
				enableReadyCheck: false, maxRetriesPerRequest: null
			})
		}
	);

	get queue() {
		return this.EmailQueue;
	}

	get queueScheduler() {
		return this.EmailQueueScheduler;
	}
}

export { EmailQueuingService };

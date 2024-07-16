import {Job, Worker} from "bullmq";
import dotenv from "dotenv";
import Debug from "debug";
import IoRedis from "ioredis";
import EMailHelpers from "../../helpers/email.helpers";
import generalConstants from "../../utils/constants/general.const";

dotenv.config();
const debug = Debug("kargoline:email-worker");

class EmailBackgroundWorker extends EMailHelpers {
	private emailWorker: Worker;

	constructor() {
		super();
	}

	public async doWork() {
		this.emailWorker =  new Worker(generalConstants.queueNames.emailQueue,
			async (job) => {
				switch (job.name) {
					case generalConstants.jobNames.signupMailJob:
						await this.sendMailVerificationMail(job.data.email,
							job.data.token, job.data.id);
						break;
					case generalConstants.jobNames.sendMFASuccessMessage:
						await this.sendMFASuccessMessage(job.data.email);
						break;
					default:
						break;
				}
			},
			{
				connection: new IoRedis(process.env.REDIS_URL, {
					maxRetriesPerRequest: null,
					enableReadyCheck: false
				})
			}
		);

		this.handleWorkerEvents();
	}

	private handleWorkerEvents(): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.emailWorker.on("completed", (job: Job, result: any) => {
			if(job.name === generalConstants.jobNames.signupMailJob) {
				debug(`Verification mail has be sent successfully \nDATA: ${result}`);
			}
		});

		this.emailWorker.on("progress", (job: Job, progress: number | object) => {
			if(job.name === generalConstants.jobNames.signupMailJob) {
				debug(`Sending email...${progress}`);
			}
		});

		this.emailWorker.on("failed", (job: Job, error: Error) => {
			if(job.name === generalConstants.jobNames.signupMailJob) {
				debug(`Failed to send verification mail to user \nERROR: ${error}`);
			}
		});
	}

	get worker(): Worker {
		return this.emailWorker;
	}
}

export default EmailBackgroundWorker;

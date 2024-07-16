import IoRedis, { Redis, RedisOptions } from "ioredis";
import dotenv from "dotenv";
import Debug from "debug";
import scriptExecutor from "../scriptExecutor";

dotenv.config();
const debug = Debug("kargoline:redis.service");

class IoRedisWrapper {
	private static connection?: Redis;

	private static readonly options: RedisOptions = {
		password: process.env.REDIS_AUTH,
		connectTimeout: 15000,
		retryStrategy: (attempts) => {
			if (attempts > 10) {
				debug("10 attempts done");
			}
			debug("Attempting connection...");
			// reconnect after (in ms)
			return 1000000;
		}
	}

	public static async client(): Promise<Redis> {
		if (!this.connection) {
			this.connection = new IoRedis(process.env.REDIS_URL, this.options);
		}
		if (this.connection.status === "end") {
			await this.connection.connect();
		}

		this.handleEvents();

		return this.connection;
	}

	private static handleEvents(): void {
		this.connection
			.on("connect", () => {
				debug("Redis server connected");
			})
			.on("ready", () => {
				debug("Redis server ready");
			})
			.on("error", (err) => {
				debug("Redis error", err.message);
				if (err.code === "ECONNREFUSED") {
					scriptExecutor.startRedisServer();
				}
			})
			.on("reconnecting", () => {
				debug("Redis reconnecting...");
			})
			.on("close", () => {
				debug("Redis server closed");
			});
	}
}

export default IoRedisWrapper;

import { spawn, SpawnOptions, ChildProcess } from "child_process";
import Debug from "debug";

const debug = Debug("kargoline:redis.service");

class ScriptExecutor {
	private command: string;
	private spawnOptions: SpawnOptions = {
		shell: true
	};

	public startRedisServer(): void {
		this.command = "npm run redis:start";
		const redisChildProcess = this.startChildProcess();
		redisChildProcess.kill("SIGINT");
	}

	public startApolloServer(): void {
		this.command = "npm run dev";
		this.spawnOptions.stdio = "inherit";
		this.startChildProcess();
	}

	private startChildProcess() {
		const childProcess: ChildProcess = spawn(this.command, this.spawnOptions);

		childProcess.stdout.on("data", data => {
			debug(`stdout: ${data}`);
		});

		childProcess.stderr.on("data", data => {
			debug(`stderr: ${data}`);
		});

		childProcess.on("error", (error) => {
			debug(`error: ${error.message}`);
		});

		childProcess.on("close", code => {
			debug(`child process exited with code ${code}`);
		});

		return childProcess;
	}
}

export default new ScriptExecutor();

import { IErrorData } from "../interfaces";
import { exceptionErrorConstants } from "../utils/constants/error.const";

export abstract class CustomErrors extends Error {
	protected abstract status: number;
	protected abstract title: string;

	protected constructor(message: string){
		super(message);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, CustomErrors);
		}
		this.name = exceptionErrorConstants.customError;
	}

	get data(): IErrorData {
		return {
			status: this.status,
			message: this.message,
			name: this.title,
			syscal: this.name
		};
	}
}

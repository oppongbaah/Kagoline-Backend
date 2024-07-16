import { CustomErrors } from "../customError.error";
import { exceptionErrorConstants } from "../../utils/constants/error.const";

export default class RedirectErrors extends CustomErrors {
	protected status: number = null;
	protected title = exceptionErrorConstants.redirectException;

	constructor(message: string) {
		super(message.split(":")[0]);
		this.status = parseInt(message.split(":")[1]);
	}
}

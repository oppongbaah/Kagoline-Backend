import { CustomErrors } from "../customError.error";
import { StatusCodes } from "../../enums";
import { exceptionErrorConstants } from "../../utils/constants/error.const";

export class NotFoundError extends CustomErrors {
	protected status = StatusCodes.NOT_FOUND;
	protected title = exceptionErrorConstants.notFOundException;

	constructor(message: string) {
		super(message);
	}
}

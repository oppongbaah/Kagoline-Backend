import { StatusCodes } from "../../enums";
import { CustomErrors } from "../customError.error";
import { exceptionErrorConstants } from "../../utils/constants/error.const";

export class BadRequestError extends CustomErrors {
	public status = StatusCodes.BAD_REQUEST;
	public title = exceptionErrorConstants.badRequestException;

	constructor(message: string) {
		super(message);
	}
}

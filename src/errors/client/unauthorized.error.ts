import { StatusCodes } from "../../enums";
import { CustomErrors } from "../customError.error";
import { exceptionErrorConstants } from "../../utils/constants/error.const";

export class Unauthorized extends CustomErrors {
	public status = StatusCodes.UNAUTHORIZED;
	public title = exceptionErrorConstants.unauthorizedException;

	constructor(message: string) {
		super(message);
	}
}

import { BadRequestError } from "./badRequest.error";
import { NotFoundError } from "./notFound.error";
import { Unauthorized } from "./unauthorized.error";
import { CustomErrors } from "../customError.error";

export default class ClientErrors extends CustomErrors {
	protected status: number = null;
	protected title = "Request Exception";

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

export { BadRequestError, NotFoundError, Unauthorized };

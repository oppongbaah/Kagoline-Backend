import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { NotFoundError } from "../errors/client";
import expressGlobalErrorHandler from "../middleware/express.errorHandler.global";
import generalConstants from "../utils/constants/general.const";
import { exceptionErrorConstants } from "../utils/constants/error.const";

class ExpressApplication {
	protected app = express();

	constructor() {
		this.applyDefaultMiddleware();
		this.initializeRoutes();
		this.handleErrors();
	}

	private applyDefaultMiddleware() {
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(express.static(path.join(__dirname,
			generalConstants.staticPath)));
		this.app.use(cookieParser());
		this.app.use(morgan(generalConstants.combined));
	}

	private initializeRoutes() {
		//
	}

	private handleErrors() {
		this.app.use(generalConstants.asterisk, () => {
			throw new NotFoundError(exceptionErrorConstants.notFoundErrorMessage);
		});
		this.app.use(expressGlobalErrorHandler);
	}

	get root() {
		return this.app;
	}
}

export default new ExpressApplication();

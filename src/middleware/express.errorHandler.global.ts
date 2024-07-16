/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import ClientErrors, { BadRequestError, Unauthorized } from "../errors/client";
import RedirectErrors from "../errors/redirects";
import logger from "../extensions/logger";
import mongoose from "mongoose";
import { IErrorNoException } from "../interfaces";
import { exceptionErrorConstants } from "../utils/constants/error.const";

const expressGlobalErrorHandler = (error: Error, _: Request, res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	__: NextFunction) => {
	let errorInstance;

	if (error instanceof ClientErrors) {
		logger.error(error.data.message);
		return res.status(error.data.status).json({
			status: exceptionErrorConstants.fail,
			data: error.data,
			syscal: exceptionErrorConstants.clientException
		});
	}

	if (error instanceof BadRequestError) {
		logger.error(error.data.message);
		errorInstance = new ClientErrors(error.message, error.status);
		return res.status(errorInstance.data.status).json({
			status: exceptionErrorConstants.fail,
			data: errorInstance.data,
			syscal: exceptionErrorConstants.badRequestException
		});
	}

	if (error instanceof Unauthorized) {
		logger.error(error.data.message);
		errorInstance = new ClientErrors(error.message, error.status);
		return res.status(errorInstance.data.status).json({
			status: exceptionErrorConstants.fail,
			data: errorInstance.data,
			syscal: exceptionErrorConstants.unauthorizedException
		});
	}

	if (error instanceof RedirectErrors) {
		logger.error(error.data.message);
		return res.status(error.data.status).json({
			status: exceptionErrorConstants.fail,
			data: error.data,
			syscal: exceptionErrorConstants.redirectException
		});
	}

	if (error instanceof mongoose.Error.ValidationError) {
		const errData: any = {};
		const validationErrors: any = error.errors;

		for (const errorKey in validationErrors) {
			const validationError = validationErrors[errorKey];
			errData[validationError.path] = validationError.message;
		}

		logger.error(JSON.stringify(errData));
		return res.status(400).json({
			status: exceptionErrorConstants.invalid,
			data: errData,
			syscal: exceptionErrorConstants.validationException
		});
	}

	if (error.name === exceptionErrorConstants.mongoError) {
		const err = error as IErrorNoException;
		logger.error(err.message);
		switch (err.code) {
			case 11000:
				return res.status(400).json({
					status: exceptionErrorConstants.duplicateKey,
					message: err.message,
					syscal: exceptionErrorConstants.mongoDbException
				});
			case 112:
				return res.status(400).json({
					status: exceptionErrorConstants.writeConflict,
					message: err.message,
					syscal: exceptionErrorConstants.mongoDbException
				});
			case 211:
				return res.status(400).json({
					status: exceptionErrorConstants.badConfiguration,
					message: err.message,
					syscal: exceptionErrorConstants.mongoDbException
				});
			default:
				break;
		}
	}

	logger.error(exceptionErrorConstants.internalServerErrorMessage, error);
	return res.status(500).send({
		status: exceptionErrorConstants.fail,
		data: [{ message: "Unknown error. Kindly contact the administrator for help" }],
		syscal: exceptionErrorConstants.internalServerErrorMessage
	});
};

export default expressGlobalErrorHandler;

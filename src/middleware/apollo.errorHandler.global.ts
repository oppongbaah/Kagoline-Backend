/* eslint-disable @typescript-eslint/no-explicit-any */
import ClientErrors, { BadRequestError, Unauthorized } from "../errors/client";
import RedirectErrors from "../errors/redirects";
import logger from "../extensions/logger";
import { GraphQLError } from "graphql";
import { exceptionErrorConstants } from "../utils/constants/error.const";
import { TokenExpiredError, JsonWebTokenError, NotBeforeError } from "jsonwebtoken";
import { ApolloError } from "apollo-server-errors";

const apolloGlobalErrorHandler = (error: Error) => {
	// handle graphql errors
	if (error instanceof GraphQLError) {
		const graphqlError = error as any;
		let errorInstance;

		switch (graphqlError.extensions.exception.title) {
			case exceptionErrorConstants.badRequestException:
				logger.error(JSON.stringify(error));
				errorInstance = new BadRequestError(error.message);
				return errorInstance.data;
			case exceptionErrorConstants.unauthorizedException:
				logger.error(JSON.stringify(error));
				errorInstance = new Unauthorized(error.message);
				return errorInstance.data;
			case exceptionErrorConstants.redirectException:
				logger.error(JSON.stringify(error));
				errorInstance = new RedirectErrors(error.message);
				return errorInstance.data;
			case exceptionErrorConstants.clientException:
				logger.error(JSON.stringify(error));
				errorInstance = new ClientErrors(error.message, 400);
				return errorInstance.data;
			default:
				logger.error(JSON.stringify(error));
				errorInstance = new ApolloError(error.message, "500");
				return {
					statusCode: errorInstance.extensions.code,
					message: "Unknown error. Kindly contact the administrator for help",
					name: exceptionErrorConstants.internalServerErrorMessage,
					syscal: exceptionErrorConstants.internalServerException
				};
		}
	}

	// handle jwt authentication errors.
	// These are context errors, do not log them
	if (error instanceof TokenExpiredError) {
		logger.error("TokenExpiredError: " + JSON.stringify(error));
		return {
			name: error.name,
			message: "Login failed! Please try again",
		};
	}

	if (error instanceof JsonWebTokenError) {
		logger.error("JsonWebTokenError: " + JSON.stringify(error));
		return {
			name: error.name,
			message: "Login failed! Please try again"
		};
	}

	if (error instanceof NotBeforeError) {
		logger.error("NotBeforeError: " + JSON.stringify(error));
		return {
			name: error.name,
			message: "Login failed! Please try again",
		};
	}

	logger.error(exceptionErrorConstants.unknownError + ": " + JSON.stringify(error));
	return {
		name: exceptionErrorConstants.unknownError,
		message: "Unknown error. Kindly contact the administrator for help"
	};
};

export default apolloGlobalErrorHandler;

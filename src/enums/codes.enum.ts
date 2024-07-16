/**
 * @enum StatusCodes
 */
export enum StatusCodes {
    OK = 200,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	NOT_FOUND = 404
}

export enum DBConnectionErrorCodes {
	noConnection = "ESERVFAIL",
	serverDown = "ECONNREFUSED"
}

export enum ProcessCodes {
	default = 0,
	terminate = "SIGTERM"
}

export enum StatusText {
	fail = "FAIL",
	ok = "SUCCESS",
	invalid = "INVALID",
	duplicate = "DUPLICATE_KEY",
	write = "WRITE_CONFLICT",
	config = "BAD_CONFIGURATION"
}

export enum Exceptions {
	badRequest = "BadRequestException",
	unauthorized = "UnauthorizedException",
	internalServer = "InternalServerException",
	redirect = "RedirectException",
	validation = "ValidationError",
	mongo = "MongoErrorException",
	notFound = "NotFoundException",
	client = "ClientException"
}

export enum HttpMethods {
	GET = "GET"
}

export enum AuthErrorCodes {
	missingHeader = "AH001",
	invalidToken = "AT001"
}

export enum HashAndEncodeAlgorithms {
	aes256 = "aes-256-cbc",
	hs256 = "HS256"
}

export enum AuthOProviders {
	FACEBOOK = "facebook",
	GOOGLE = "google"
}

interface ISocialStrategyConstants {
	strategy: string
	loginRoute: string
	callbackRoute: string
	errorMessage?: string
	scope?: string[]
}

type GraphqlPassport = | "graphql-local"
interface ILocalStrategyConstants {
	loginRoute: GraphqlPassport
}

export interface IGeneralConstants {
	defaultPort?: number
	emptyString?: string
	dbSuccessMessage?: string
	dbFailureMessage?: string
	debugDatabase?: string
	debugServer?: string
	serverBooting?: string
	serverBooted?: string
	portInUse?: string
	serverShutting?: string
	serverListen?: string
	serverListening?: string
	serverClose?: string
	serverError?: string
	serverWaitTime?: number
	homeRoute?: string
	adminRoute?: string
	riderRoute?: string
	signupRoute?: string
	backSlash?: string
	combined?: string
	staticPath?: string
	asterisk?: string
	welcomeMessage?: string
	logDebugLevel?: string
	logErrorLevel?: string
	logTimeFormat?: string
	logMaxSize?: string
	logMaxFiles?: string
	logDatePattern?: string
	logsFolder?: string
	logsFile?: string
	productionEnv?: string
	developmentEnv?: string
	apolloServerBooted?: string
	applicationName?: string
	graphqlRoute?: string
	tokenRedisKey?: string,
	roles?: string
	permissions?: string
	facebookAuthO2?: ISocialStrategyConstants
	googleAuthO2?: ISocialStrategyConstants
	localAuthO?: ILocalStrategyConstants
	failureRedirectUrl?: string
	successRedirectUrl?: string
}

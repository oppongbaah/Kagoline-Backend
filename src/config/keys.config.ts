import dotenv from "dotenv";
import generalConstants from "../utils/constants/general.const";

dotenv.config();

const clusterUri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}`
	+ `@${process.env.MONGODB_CLUSTER}.o2ngt.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true`;

const MONGO_URI: string = process.env.MONGODB_TEST ?? clusterUri;

if (process.env.NODE_ENV !== generalConstants.productionEnv) {
	dotenv.config();
}

export { MONGO_URI };

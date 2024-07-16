import prodLogger from "./production.log";
import devLogger from "./development.log";
import generalConstants from "../../utils/constants/general.const";

const logger = () => {
	if (process.env.NODE_ENV === generalConstants.productionEnv) {
		return prodLogger();
	}
	return devLogger();
};

export default logger();

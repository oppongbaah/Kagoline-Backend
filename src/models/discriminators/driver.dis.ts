import { UserModel } from "../user";
import { DriverSchema } from "../schema/driver.schema";
import generalConstants from "../../utils/constants/general.const";

const DriverModel = UserModel.discriminator(generalConstants.driverDiscriminator, DriverSchema);

export { DriverModel };

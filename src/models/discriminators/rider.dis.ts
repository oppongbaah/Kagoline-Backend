import { UserModel } from "../user";
import { RiderSchema } from "../schema/rider.schema";
import generalConstants from "../../utils/constants/general.const";

const RiderModel = UserModel.discriminator(generalConstants.riderDiscriminator, RiderSchema);

export { RiderModel };

import { UserModel } from "../user";
import { AdminSchema } from "../schema/admin.schema";
import generalConstants from "../../utils/constants/general.const";

const AdminModel = UserModel.discriminator(generalConstants.adminDiscriminator, AdminSchema);

export { AdminModel };

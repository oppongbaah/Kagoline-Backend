import { Document} from "mongoose";
import { TruckCategories } from "../../../enums";

export interface ITruckModelData extends Document {
	_id?: string
	regNo: string
	brand: string
	modelNo: string
	category?: TruckCategories
}

import { Types } from "mongoose";

export interface ITruckResponseData {
	_id: Types.ObjectId
	regNo: string
	brand: string
	modelNo: string
	category?: string
}

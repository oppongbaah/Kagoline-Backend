/* eslint-disable @typescript-eslint/ban-types */

import { TruckModel } from "../models";
import { ITruckModelData, ITruckResponseData } from "../interfaces";
import { QueryServices } from "./query.svc";
import { BadRequestError } from "../errors/client";

class TruckServices extends QueryServices {
	constructor() {
		super(TruckModel);
	}

	public async findAll(): Promise<ITruckResponseData[]> {
		return this.fetchAll<ITruckResponseData>();
	}

	public async findOne(truckId: string): Promise<ITruckResponseData> {
		return this.fetchOne({ _id: truckId });
	}

	public async saveOne(truckData: ITruckModelData): Promise<ITruckResponseData> {
		const exists = await this.documentExist({ regNo: truckData.regNo });

		if (exists) {
			throw new BadRequestError("Truck with the registering number is already registered");
		}

		const response = await this.push<ITruckModelData, ITruckResponseData>([truckData]);
		return response[0];
	}

	public async removeOne(truckId: string): Promise<unknown> {
		const exists = await this.documentExist({ _id: truckId });

		if (!exists) {
			throw new BadRequestError("No truck with the registration number was found");
		}
		const removedTruck = await this.deleteOneById<ITruckModelData>(truckId);

		if (!removedTruck) {
			throw new BadRequestError("We encountered a problem removing the truck with the specified registration number. Kindly contact the administrator for further assistance");
		}

		return `The truck with the registration number ${removedTruck.regNo} has been removed successfully`;
	}

	public async updateOne(truckId: string, data: Object): Promise<ITruckResponseData> {
		const exists = await this.documentExist({ _id: truckId });

		if (!exists) {
			throw new BadRequestError("No truck with the registration number was found");
		}

		return this.updateOneById(truckId, data);
	}
}

export { TruckServices };

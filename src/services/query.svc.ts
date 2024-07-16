/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { FilterQuery, Model } from "mongoose";
import { IUserRequestModelData, ICheckUser } from "../interfaces";
import { Roles } from "../enums";
import redis from "../extensions/redis.ext";

class QueryServices {
	private model: Model<any>;

	constructor(model: Model<any>) {
		this.model = model;
	}

	protected async fetchAll<T>(params: Object = {}) : Promise<T[]> {
		return this.model.find(params);
	}

	protected async fetchById(id: string, select = ""): Promise<any> {
		if (select) {
			return this.model.findById(id, select).exec();
		}

		return this.model.findById(id);
	}

	protected async fetchOne(filter: Object): Promise<any> {
		return this.model.findOne(filter);
	}

	protected async push<RequestType, ResponseType>(dataToPush: RequestType[])
	: Promise<ResponseType[]> {
		const createdData = await this.model.create(dataToPush);
		return createdData.map(data => data.toJSON());
	}

	protected async updateOneById(id: string, update: Object): Promise<any> {
		return this.model.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true,
			useFindAndModify: false
		});
	}

	protected async updateOneByAny(filter: Object, update: Object): Promise<any> {
		return this.model.updateOne(filter, update);
	}

	protected async deleteOneById<T>(id: string): Promise<T> {
		return this.model.findByIdAndRemove(id);
	}

	protected async documentExist(filter: Object): Promise<boolean> {
		return this.model.exists(filter);
	}

	protected async userExist(email: string, role: Roles | string = Roles.empty)
	: Promise<ICheckUser> {
		const redisClient = await redis.client();
		const roles = role || await redisClient.get("roles");

		const filters: FilterQuery<IUserRequestModelData> = { email };
		if (roles && roles !== Roles.empty) {
			filters.role = roles.toUpperCase();
		}

		const userModel = await this.model.findOne(filters).exec();
		const user = userModel ? userModel.toJSON() : null;
		const response: ICheckUser = {
			exist: !!user,
			payload: user
		};
		await redisClient.del("roles");

		return response;
	}
}

export { QueryServices };

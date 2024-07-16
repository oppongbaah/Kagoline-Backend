import { TruckCategories } from "../enums";

export class TruckUtilities {
	public static decorateTruckCategory(category: string): string {
		let decoratedCategory: string;

		switch (category) {
			case TruckCategories.A:
				decoratedCategory = "Heavy Duty";
				break;
			case TruckCategories.B:
				decoratedCategory = "Normal";
				break;
			case TruckCategories.C:
				decoratedCategory = "Light Duty";
				break;
			default:
				decoratedCategory = "";
				break;
		}

		return decoratedCategory;
	}
}

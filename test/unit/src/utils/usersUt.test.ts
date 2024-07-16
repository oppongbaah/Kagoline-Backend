/* eslint-disable no-undef */
import { UserUtilities } from "../../../../src/utils/users.util";

describe("test the user utility file", () => {
	const firstName = "Isaac";
	const lastName = "Oppong-Baah";

	it("generate a username", () => {
		const username = UserUtilities.generateUsername(firstName, lastName);
		expect(username).toBe("isaacop");
	});

	it("get the fullname", () => {
		const fullName = UserUtilities.getFullName(firstName, lastName);
		expect(fullName).toBe("Isaac Oppong-Baah");
	});
});

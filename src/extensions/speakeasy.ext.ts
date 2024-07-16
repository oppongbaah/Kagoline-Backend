/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import * as speakeasy from "speakeasy";
import { IOPTAuthSecret } from "../interfaces";
import dotenv from "dotenv";
import QRCode from "qrcode";
import fs from "fs";
import logger from "./logger";
import { BadRequestError } from "../errors/client";
import { authErrorConstants } from "../utils/constants/error.const";

dotenv.config();

type Class = new (...args: any[]) => Object;
const SpeakeasyAuthMixinExt = <Base extends Class>(base: Base) => {
	return class extends base  {

		public getTwoFactorAuthenticationCode(email: string): IOPTAuthSecret {
			const secretCode: speakeasy.GeneratedSecret = speakeasy.generateSecret({
				name: `${process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME} (${email})`,
				issuer: email
			});

			return {
				otpAuthUrl : secretCode.otpauth_url,
				base32: secretCode.base32,
			};
		}

		public async generateQrCode(url: string): Promise<string> {
			const qrCode = await QRCode.toDataURL(url);

			// for testing purposes
			const base64 = qrCode.split(";base64,")[1].trim();
			const image = Buffer.from(base64, "base64");
			fs.writeFile("./qrcode.png", image, (err) => {
				logger.error(err);
			});

			return qrCode;
		}

		public async verifyTwoFactorAuthenticationSecret(secret: string, token: string)
		: Promise<void> {
			const verified = speakeasy.totp.verify({
				secret,
				encoding: "base32",
				token
			});

			if (!verified) {
				throw new BadRequestError(authErrorConstants.invalidTotpToken);
			}
		}
	};
};

export { SpeakeasyAuthMixinExt };

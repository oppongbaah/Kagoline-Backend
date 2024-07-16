import dotenv from "dotenv";
import generalConstants from "../utils/constants/general.const";
import sgMail from "@sendgrid/mail";
import { ClientResponse } from "@sendgrid/client/src/response";
import logger from "../extensions/logger";

dotenv.config();

abstract class EmailHelpers {
	protected async sendMailVerificationMail(email: string, accessToken: string, id: string)
	: Promise<void> {
		const template = `
			<h1> ${generalConstants.verifyEmailContent.bodyText} </h1>
			<br>
			<button style="width: 90%; height: 50px; background-color: orange">
				<a style="color: white; font-size: 18px; font-weight: bolder"
					href="${generalConstants.host}:${generalConstants.graphqlPort}${generalConstants.confirmEmailRoute}/${id}?verify=${accessToken}"
				>
					Confirm Email Address
				</a>
			</button>
		`;
		const subject = generalConstants.verifyEmailContent.subject;

		const response = await EmailHelpers.sendEmail(email, subject, template);
		logger.debug(response);
	}

	protected async sendMFASuccessMessage(email: string): Promise<void> {
		const template = `
			<h1> ${generalConstants.totpEmailContent.bodyText} </h1>
			<p> Thank you for setting up 2FA with Google AUthenticator </p>
		`;
		const subject = generalConstants.totpEmailContent.subject;
		const username = "Kargoline Security Team";

		const response = await EmailHelpers.sendEmail(email, subject, template, username);
		logger.debug(response);
	}

	private static async sendEmail(email: string, subject: string, template: string, username = "")
	: Promise<[ClientResponse, unknown]> {
		try {
			const message = {
				from: {
					email: process.env.SENDGRID_VERIFIED_EMAIL,
					name: username || process.env.SENDGRID_VERIFIED_USER
				},
				personalizations: [
					{
						to: [
							{
								email: email
							}
						],
						subject
					}
				],
				html: template
			};

			sgMail.setApiKey(process.env.SENDGRID_API_KEY);

			return await sgMail.send(message);
		} catch (err) {
			logger.error(err);
		}
	}
}

export default EmailHelpers;

import { HttpFunction } from "@google-cloud/functions-framework";
import { CommunicationKey, EmailService } from "./services/email.service";
import config from "./config.parser";

const emailService = new EmailService();

export const temperatureWarning: HttpFunction = async (req, res) => {
  const { temperature } = req.body;
  await emailService.sendEmail({
    key: CommunicationKey.temperatureWarning,
    model: { temperature },
    recipient: { email: config.temperature.recipient },
  });
  res.status(200).send("Email sent");
};

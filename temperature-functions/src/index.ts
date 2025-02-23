import { CommunicationKey, EmailService } from "./services/email.service";
import config from "./config.parser";
import * as Sentry from "@sentry/google-cloud-serverless";

Sentry.init({
  dsn: config.sentry.dsn,
});

const emailService = new EmailService();

export const temperatureWarning = Sentry.wrapHttpFunction(async (req, res) => {
  const { temperature } = req.body;
  await emailService.sendEmail({
    key: CommunicationKey.temperatureWarning,
    model: { temperature },
    recipient: { email: config.temperature.recipient },
  });
  res.status(200).send("Email sent");
});

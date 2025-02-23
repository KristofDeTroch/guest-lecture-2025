import sgMail from "@sendgrid/mail";
import config from "../config.parser";
import * as fs from "node:fs";
import Handlebars from "handlebars";

export enum CommunicationKey {
  temperatureWarning = "temperatureWarning",
}

export type CommunicationModelMap = {
  [CommunicationKey.temperatureWarning]: {
    temperature: number;
  };
};

const templateMap: Record<
  CommunicationKey,
  { bodyPath: string; subject: string }
> = {
  [CommunicationKey.temperatureWarning]: {
    bodyPath: "temperature.warning.hbs",
    subject: "Temperature Warning Alert",
  },
};

export interface CommunicationRequestBody<
  Key extends CommunicationKey = CommunicationKey
> {
  recipient: { name?: string; email: string };
  model: CommunicationModelMap[Key];
  key: Key;
}

export class EmailService {
  constructor() {
    sgMail.setApiKey(config.sendgrid.apiKey);
  }

  async sendEmail<T extends CommunicationKey>({
    model,
    key,
    recipient: to,
  }: CommunicationRequestBody<T>) {
    const templates = templateMap[key];
    const bodyTemplate = fs.readFileSync(
      `${__dirname}/templates/${templates.bodyPath}`,
      "utf8"
    );
    const subject = Handlebars.compile(templates.subject)(model);
    const html = Handlebars.compile(bodyTemplate)(model);
    await sgMail.send({ to, from: config.sendgrid.from, subject, html });
  }
}

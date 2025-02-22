import { Injectable } from '@nestjs/common';
import { CommunicationKey, EmailService } from '~/services/email.service';
import { CreateTemperatureBody } from '../body/create.temperature.body';
import config from '~/config.parser';

@Injectable()
export class CreateTemperatureHandler {
  constructor(private readonly emailService: EmailService) {}

  async execute(body: CreateTemperatureBody) {
    if (body.temperature > config.temperature.threshold) {
      await this.emailService.sendEmail({
        key: CommunicationKey.temperatureWarning,
        recipient: { email: config.temperature.recipient },
        model: {
          temperature: body.temperature,
        },
      });
    } else {
      console.log(`Temperature (${body.temperature}) is below threshold (${config.temperature.threshold})`);
    }
  }
}

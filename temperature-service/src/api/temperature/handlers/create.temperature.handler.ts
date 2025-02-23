import { Injectable } from '@nestjs/common';
import { CreateTemperatureBody } from '../body/create.temperature.body';
import config from '~/config.parser';
import { PublisherService } from '~/services/publiser.service';

@Injectable()
export class CreateTemperatureHandler {
  constructor(private readonly publisherService: PublisherService) {}

  async execute(body: CreateTemperatureBody) {
    if (body.temperature > config.temperature.threshold) {
      console.log(`Publishing email event for temperature ${body.temperature}`);
      await this.publisherService.publishEmailEvent({ temperature: body.temperature });
    } else {
      console.log(`Temperature (${body.temperature}) is below threshold (${config.temperature.threshold})`);
    }
  }
}

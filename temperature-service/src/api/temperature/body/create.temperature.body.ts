import { IsNumber } from 'class-validator';

export class CreateTemperatureBody {
  @IsNumber()
  temperature: number;
}

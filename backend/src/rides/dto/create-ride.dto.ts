import {
  IsISO8601,
  IsString,
  MinLength,
} from 'class-validator';
import {Transform} from "class-transformer";

export class CreateRideDto {

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(5)
  pickup_location: string;


  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(5)
  destination_location: string;

  @IsISO8601()
  scheduled_time: string;
}

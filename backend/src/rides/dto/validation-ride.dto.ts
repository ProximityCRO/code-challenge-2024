import { IsInt, IsPositive, IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class ValidationRideDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(4)
  pin: string;

  @IsInt()
  @IsPositive()
  ride_id: number;
}

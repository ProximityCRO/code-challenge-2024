import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateVehicleDto {
  @IsInt()
  @IsPositive()
  driver_id: number;

  @IsPositive()
  @IsInt()
  year: number;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  color: string;
}

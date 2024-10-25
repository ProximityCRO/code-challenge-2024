import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateVehicleDto {
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

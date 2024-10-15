import { IsInt, IsPositive } from "class-validator";

export class CreateOfferDto {
  @IsInt()
  @IsPositive()
  ride_id: number;

  @IsPositive()
  price: number;
}

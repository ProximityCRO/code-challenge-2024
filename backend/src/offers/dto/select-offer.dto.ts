import { IsInt, IsPositive } from "class-validator";

export class SelectOfferDto {
  @IsInt()
  @IsPositive()
  ride_id: number;

  @IsInt()
  @IsPositive()
  offer_id: number;
}

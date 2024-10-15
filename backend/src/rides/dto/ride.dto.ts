import { Expose, Type } from "class-transformer";
import { OfferResponseDto } from "../../offers/dto/offer.dto";

export class RideResponseDto {
  @Expose()
  id: number;

  @Expose()
  user_id: number;

  @Expose()
  @Type(() => OfferResponseDto)
  offer: OfferResponseDto | null;

  @Expose()
  status: string;

  @Expose()
  pin: string | null;

  @Expose()
  pickup_location: string;

  @Expose()
  destination_location: string;

  @Expose()
  scheduled_time: Date;

  @Expose()
  review: number | null;
}

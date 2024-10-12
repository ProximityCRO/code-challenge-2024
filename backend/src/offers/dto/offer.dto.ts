import { Expose, Type } from "class-transformer";
import { UserResponseDTO } from "../../users/dto/user.dto";

export class OfferResponseDto {
  @Expose()
  id: number;

  @Expose()
  driver_id: number;

  @Expose()
  price: number;
}

export class OfferResponseExpandDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserResponseDTO)
  driver: UserResponseDTO | null;

  @Expose()
  ride_id: number;

  @Expose()
  price: number;

  @Expose()
  selected: boolean;
}

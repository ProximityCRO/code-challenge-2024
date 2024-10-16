import { Expose, Type } from "class-transformer";
import { UserResponseDTO } from "../../users/dto/user.dto";

export class ReviewResponseDto {
  @Expose()
  id: number;

  @Expose()
  driver_id: number;

  @Expose()
  rating: number;

  @Expose()
  comments: string;
}

export class ReviewResponseExpandDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserResponseDTO)
  driver: UserResponseDTO | null;

  @Expose()
  @Type(() => UserResponseDTO)
  user: UserResponseDTO | null;

  @Expose()
  ride_id: number;

  @Expose()
  rating: number;

  @Expose()
  comments: string;

  @Expose()
  created_at: Date;
}

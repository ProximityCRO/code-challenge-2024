import { Expose, Type } from "class-transformer";
import { ReviewResponseExpandDto } from "../../reviews/dto/review.dto";

export class UserProfileDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name?: string;

  @Expose()
  role?: string;

  @Expose()
  phone_number: string;

  @Expose()
  vehicle: string | null;

  @Expose()
  rating_average: number | null;

  @Expose()
  @Type(() => ReviewResponseExpandDto)
  reviews: ReviewResponseExpandDto[];
}

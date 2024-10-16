import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateReviewDto {
  @IsInt()
  @IsPositive()
  driver_id: number;

  @IsInt()
  @IsPositive()
  ride_id: number;

  @IsInt()
  @IsPositive()
  user_id: number;

  @IsPositive()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comments: string;
}

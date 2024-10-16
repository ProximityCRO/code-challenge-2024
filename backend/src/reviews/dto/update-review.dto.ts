import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateReviewDto {
  @IsPositive()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comments: string;
}

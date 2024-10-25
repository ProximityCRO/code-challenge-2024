import { IsString } from "class-validator";
import { Transform } from "class-transformer";

export class TextDTO {
  @Transform(({ value }) => value.trim())
  @IsString()
  text: string;
}

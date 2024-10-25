import { IsEnum, IsInt, IsPositive, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { Status } from "../../common/enums/status.enum";

export class UpdateRideDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsEnum(Status, {
    message:
      "Status must be one of the following: requested, started, completed, accepted",
  })
  status: Status;

  @IsInt()
  @IsPositive()
  ride_id: number;
}

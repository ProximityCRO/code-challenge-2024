import { Expose } from "class-transformer";

export class VehicleResponseDto {
  @Expose()
  id: number;

  @Expose()
  driver_id: number;

  @Expose()
  year: number;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  color: string;
}

import { Expose } from "class-transformer";

export class UserResponseDTO {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name?: string;

  @Expose()
  phone_number: string;
}

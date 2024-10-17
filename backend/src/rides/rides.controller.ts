import { Body, Controller, Get, Post } from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ActiveUser } from "src/common/decorators/active-user.decorator";
import { Role } from "src/common/enums/rol.enum";
import { UserActiveInterface } from "src/common/interfaces/user-active.interface";
import { RidesService } from "./rides.service";
import { CreateRideDto } from "./dto/create-ride.dto";
import { ValidationRideDto } from "./dto/validation-ride.dto";

@Auth([Role.DRIVER, Role.USER])
@Controller("ride")
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  create(
    @Body() createCatDto: CreateRideDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.ridesService.create(createCatDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.ridesService.findAll(user);
  }

  @Post("validation")
  validation(
    @Body() validationRideDto: ValidationRideDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.ridesService.validation(validationRideDto, user);
  }
}

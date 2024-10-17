import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ActiveUser } from "src/common/decorators/active-user.decorator";
import { Role } from "src/common/enums/rol.enum";
import { UserActiveInterface } from "src/common/interfaces/user-active.interface";
import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

@Auth([Role.DRIVER, Role.USER])
@Controller("vehicle")
export class VehiclesController {
  constructor(private readonly reviewsService: VehiclesService) {}

  @Post()
  create(
    @Body() vehicleDto: CreateVehicleDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.reviewsService.create(vehicleDto, user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.reviewsService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @ActiveUser() user: UserActiveInterface,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.reviewsService.update(+id, updateVehicleDto);
  }
}

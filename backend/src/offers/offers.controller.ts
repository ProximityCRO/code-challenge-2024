import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ActiveUser } from "src/common/decorators/active-user.decorator";
import { Role } from "src/common/enums/rol.enum";
import { UserActiveInterface } from "src/common/interfaces/user-active.interface";
import { OffersService } from "./offers.service";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { SelectOfferDto } from "./dto/select-offer.dto";

@Auth([Role.DRIVER, Role.USER])
@Controller("offer")
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(
    @Body() createOfferDto: CreateOfferDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.offersService.create(createOfferDto, user);
  }

  @Get()
  findAllByRide(
    @ActiveUser() user: UserActiveInterface,
    @Query("ride_id") ride_id: number,
  ) {
    return this.offersService.findAllByRide(ride_id);
  }

  @Put("select-offer")
  selectOffer(
    @Body() selectOfferDto: SelectOfferDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.offersService.selectOffer(selectOfferDto, user);
  }
}

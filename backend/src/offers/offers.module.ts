import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OffersController } from "./offers.controller";
import { OffersService } from "./offers.service";
import { Offer } from "./entities/offer.entity";
import { User } from "../users/entities/user.entity";
import { Ride } from "../rides/entities/ride.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Offer, User, Ride])],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}

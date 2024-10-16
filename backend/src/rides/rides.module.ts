import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RidesController } from "./rides.controller";
import { RidesService } from "./rides.service";
import { Ride } from "./entities/ride.entity";
import { User } from "../users/entities/user.entity";
import { Offer } from "../offers/entities/offer.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Ride, User, Offer])],
  controllers: [RidesController],
  providers: [RidesService],
})
export class RidesModule {}

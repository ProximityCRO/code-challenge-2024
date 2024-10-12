import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RidesController } from "./rides.controller";
import { RidesService } from "./rides.service";
import { Ride } from "./entities/ride.entity";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Ride, User])],
  controllers: [RidesController],
  providers: [RidesService],
})
export class RidesModule {}

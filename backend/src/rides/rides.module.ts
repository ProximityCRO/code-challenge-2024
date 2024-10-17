import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RidesController } from "./rides.controller";
import { RidesService } from "./rides.service";
import { Ride } from "./entities/ride.entity";
import { User } from "../users/entities/user.entity";
import { Offer } from "../offers/entities/offer.entity";
import { Review } from "../reviews/entities/review.entity";
import { OpenAIService } from "../common/openai/open-ai.service";

@Module({
  imports: [TypeOrmModule.forFeature([Ride, User, Offer, Review])],
  controllers: [RidesController],
  providers: [RidesService, OpenAIService],
})
export class RidesModule {}

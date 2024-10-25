import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { User } from "../users/entities/user.entity";
import { Ride } from "../rides/entities/ride.entity";
import { Review } from "./entities/review.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Ride])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { Review } from "../reviews/entities/review.entity";
import { Vehicle } from "../vehicles/entities/vehicle.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Review, Vehicle])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

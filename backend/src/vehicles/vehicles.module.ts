import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VehiclesController } from "./vehicles.controller";
import { VehiclesService } from "./vehicles.service";
import { User } from "../users/entities/user.entity";
import { Vehicle } from "./entities/vehicle.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Vehicle])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}

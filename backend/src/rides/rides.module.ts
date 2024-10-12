import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreedsModule } from 'src/breeds/breeds.module';
import { BreedsService } from 'src/breeds/breeds.service';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';
import {UsersModule} from "../users/users.module";
import {UsersService} from "../users/users.service";
import {User} from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Ride, User])],
  controllers: [RidesController],
  providers: [RidesService],
})
export class RidesModule {}

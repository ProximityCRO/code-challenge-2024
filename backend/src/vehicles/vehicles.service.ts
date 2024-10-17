import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserActiveInterface } from "../common/interfaces/user-active.interface";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { Vehicle } from "./entities/vehicle.entity";
import { User } from "../users/entities/user.entity";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(
    createVehicleDto: CreateVehicleDto,
    userLogin: UserActiveInterface,
  ) {
    const driver = await this.userRepository.findOneBy({
      id: userLogin.id,
    });
    return await this.vehicleRepository.save({
      ...createVehicleDto,
      driver: driver,
    });
  }

  async findOne(id: number) {
    return await this.vehicleRepository.findOneBy({
      id: id,
    });
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    return await this.vehicleRepository.update(id, updateVehicleDto);
  }
}

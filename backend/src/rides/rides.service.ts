import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Role} from '../common/enums/rol.enum';
import {UserActiveInterface} from '../common/interfaces/user-active.interface';
import {CreateRideDto} from './dto/create-ride.dto';
import {Ride} from './entities/ride.entity';
import {Status} from "../common/enums/status.enum";
import {User} from "../users/entities/user.entity";

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRideDto: CreateRideDto, user: UserActiveInterface) {
    const current_user = await this.userRepository.findOneBy({ id: user.id });
    return await this.rideRepository.save({
      ...createRideDto,
      user: current_user,
    });
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN) {
      return await this.rideRepository.find();
    }
    if(user.role === Role.DRIVER) {
      return await this.rideRepository.find({
        where: { status: Status.REQUESTED },
      });
    }
    return await this.rideRepository.find({
      where: { user_id: user.id },
    });
  }
}

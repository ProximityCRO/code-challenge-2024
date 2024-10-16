import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../common/enums/rol.enum";
import { UserActiveInterface } from "../common/interfaces/user-active.interface";
import { CreateRideDto } from "./dto/create-ride.dto";
import { Ride } from "./entities/ride.entity";
import { Status } from "../common/enums/status.enum";
import { User } from "../users/entities/user.entity";
import { plainToInstance } from "class-transformer";
import { OfferResponseExpandDto } from "../offers/dto/offer.dto";
import { RideResponseDto } from "./dto/ride.dto";
import { Offer } from "../offers/entities/offer.entity";

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  async create(createRideDto: CreateRideDto, user: UserActiveInterface) {
    const current_user = await this.userRepository.findOneBy({ id: user.id });
    return await this.rideRepository.save({
      ...createRideDto,
      user: current_user,
    });
  }

  async findAll(user: UserActiveInterface) {
    let rides;
    if (user.role === Role.ADMIN) {
      rides = await this.rideRepository.find();
      return await this.formatResponseRideDTO(rides);
    }
    if (user.role === Role.DRIVER) {
      const driver_user = await this.userRepository.findOneBy({ id: user.id });
      const offersDriver = await this.offerRepository.find({
        where: { driver: driver_user },
        relations: ["ride"],
      });

      const requestedRides = await this.rideRepository.find({
        where: { status: Status.REQUESTED },
      });
      rides = requestedRides.concat(offersDriver.map((offer) => offer.ride));
      rides = rides.filter(
        (ride, index, self) =>
          index === self.findIndex((r) => r.id === ride.id),
      );

      return this.formatResponseRideDTO(rides);
    }
    rides = await this.rideRepository.find({
      where: { user_id: user.id },
    });
    return await this.formatResponseRideDTO(rides);
  }

  private async formatResponseRideDTO(rides: Ride[]) {
    return await Promise.all(
      rides.map(async (ride: Ride) => {
        const offer = await this.offerRepository.findOneBy({
          id: ride.offer_id,
        });
        const user_ride = await this.userRepository.findOneBy({
          id: ride.user_id,
        });
        return plainToInstance(RideResponseDto, {
          id: ride.id,
          user_id: ride.user_id,
          user: user_ride
            ? {
                id: user_ride.id,
                email: user_ride.email,
                name: user_ride.name,
                phone_number: user_ride.phone_number,
              }
            : null,
          offer: offer
            ? { id: offer.id, driver_id: offer.driver_id, price: offer.price }
            : null,
          status: ride.status,
          pin: ride.pin,
          pickup_location: ride.pickup_location,
          destination_location: ride.destination_location,
          scheduled_time: ride.scheduled_time,
          review: ride.review_id,
        });
      }),
    );
  }
}

import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../common/enums/rol.enum";
import { UserActiveInterface } from "../common/interfaces/user-active.interface";
import { CreateRideDto } from "./dto/create-ride.dto";
import { Ride } from "./entities/ride.entity";
import { Status } from "../common/enums/status.enum";
import { User } from "../users/entities/user.entity";
import { plainToInstance } from "class-transformer";
import { RideResponseDto } from "./dto/ride.dto";
import { Offer } from "../offers/entities/offer.entity";
import { Review } from "../reviews/entities/review.entity";
import { ValidationRideDto } from "./dto/validation-ride.dto";
import { UpdateRideDto } from "./dto/update-ride.dto";

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(createRideDto: CreateRideDto, user: UserActiveInterface) {
    const current_user = await this.userRepository.findOneBy({ id: user.id });
    return await this.rideRepository.save({
      ...createRideDto,
      user: current_user,
    });
  }

  async validation(
    validationRideDto: ValidationRideDto,
    user: UserActiveInterface,
  ) {
    const ride = await this.rideRepository.findOneBy({
      id: validationRideDto.ride_id,
    });
    if (ride && ride.pin === validationRideDto.pin) {
      await this.rideRepository.update(validationRideDto.ride_id, {
        status: Status.STARTED,
      });
      return { validation: true };
    }
    return { validation: false };
  }

  async delete(id: number) {
    const ride = await this.rideRepository.findOneBy({
      id: id,
    });
    if (ride && ride.status === Status.REQUESTED) {
      return this.rideRepository.delete(id);
    } else {
      throw new BadRequestException(
        "Only rides with status REQUESTED can be deleted.",
      );
    }
  }

  async findOne(id: number) {
    return await this.rideRepository.findOneBy({
      id: id,
    });
  }

  async updateStatus(updateRideDto: UpdateRideDto) {
    return await this.rideRepository.update(updateRideDto.ride_id, {
      status: updateRideDto.status,
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
        const review = await this.reviewRepository.findOneBy({
          id: ride.review_id,
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
          review: review
            ? {
                id: review.id,
                driver_id: review.driver_id,
                rating: review.rating,
                comments: review.comments,
              }
            : null,
        });
      }),
    );
  }
}

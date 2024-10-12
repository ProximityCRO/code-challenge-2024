import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserActiveInterface } from "../common/interfaces/user-active.interface";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { Offer } from "./entities/offer.entity";
import { User } from "../users/entities/user.entity";
import { Ride } from "../rides/entities/ride.entity";
import { SelectOfferDto } from "./dto/select-offer.dto";
import { RideResponseDto } from "../rides/dto/ride.dto";
import { plainToInstance } from "class-transformer";
import { generatePin } from "../common/utils/general.util";
import { Status } from "../common/enums/status.enum";
import { OfferResponseExpandDto } from "./dto/offer.dto";

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  async create(createRideDto: CreateOfferDto, user: UserActiveInterface) {
    const current_user = await this.userRepository.findOneBy({ id: user.id });
    const ride = await this.rideRepository.findOneBy({
      id: createRideDto.ride_id,
    });
    return await this.offerRepository.save({
      ...createRideDto,
      driver: current_user,
      ride: ride,
    });
  }

  async findAllByRide(ride_id: number) {
    const offers = await this.offerRepository.find({
      where: { ride_id: ride_id },
    });

    return await Promise.all(
      offers.map(async (offer) => {
        const driver = await this.userRepository.findOneBy({
          id: offer.driver_id,
        });
        return plainToInstance(OfferResponseExpandDto, {
          id: offer.id,
          ride_id: offer.ride_id,
          driver: driver
            ? {
                id: driver.id,
                email: driver.email,
                name: driver.name,
                phone_number: driver.phone_number,
              }
            : null,
          price: offer.price,
          selected: offer.selected,
        });
      }),
    );
  }

  async selectOffer(selectOfferDto: SelectOfferDto, user: UserActiveInterface) {
    const ride = await this.rideRepository.findOneBy({
      id: selectOfferDto.ride_id,
    });
    const offer = await this.offerRepository.findOneBy({
      id: selectOfferDto.offer_id,
    });
    const pin = generatePin();
    await this.offerRepository.update(selectOfferDto.offer_id, {
      ...offer,
      selected: true,
    });
    await this.rideRepository.update(selectOfferDto.ride_id, {
      ...ride,
      offer_id: selectOfferDto.offer_id,
      status: Status.ACCEPTED,
      pin: pin,
    });

    const rideResponse = {
      id: ride.id,
      user_id: ride.user_id,
      offer: {
        id: offer.id,
        driver_id: offer.driver_id,
        price: offer.price,
      },
      status: Status.ACCEPTED,
      pin: pin,
      pickup_location: ride.pickup_location,
      destination_location: ride.destination_location,
      scheduled_time: ride.scheduled_time,
      review: ride.review_id,
    };

    return plainToInstance(RideResponseDto, rideResponse);
  }
}

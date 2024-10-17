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
import { Vehicle } from "../vehicles/entities/vehicle.entity";
import { MailService } from "../common/mails/mail.service";

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly mailService: MailService,
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
        const vehicle = await this.vehicleRepository.findOneBy({
          driver: driver,
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
          vehicle: vehicle ? vehicle : null,
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

    const driverToNotify = await this.userRepository.findOneBy({
      id: offer.driver_id,
    });

    const userToNotify = await this.userRepository.findOneBy({
      id: ride.user_id,
    });

    if (driverToNotify && userToNotify) {
      const emailSubject = "Ride Confirmation";
      const emailTextContent = `Your ride has been confirmed. Details:
      Ride ID: ${rideResponse.id} - 
      Pickup Location: ${rideResponse.pickup_location} - 
      Destination Location: ${rideResponse.destination_location} - 
      Scheduled Time: ${rideResponse.scheduled_time} - 
      Status: ${rideResponse.status} -
      Driver: ${driverToNotify.name} -
      User: ${userToNotify.name} -
      Price: ${rideResponse.offer.price} -
      PIN: ${rideResponse.pin}`;

      const emailHtmlContent = `
        <h3>Ride Information</h3>
        <ul>
          <li><strong>Ride ID:</strong> ${rideResponse.id}</li>
          <li><strong>Pickup Location:</strong> ${rideResponse.pickup_location}</li>
          <li><strong>Destination Location:</strong> ${rideResponse.destination_location}</li>
          <li><strong>Scheduled Time:</strong> ${rideResponse.scheduled_time}</li>
          <li><strong>Status:</strong> ${rideResponse.status}</li>
          <li><strong>Driver:</strong> ${driverToNotify.name}</li>
          <li><strong>User:</strong> ${userToNotify.name}</li>
          <li><strong>Price:</strong> $${rideResponse.offer.price}</li>
          <li><strong>PIN:</strong> ${rideResponse.pin}</li>
        </ul>
      `;

      await this.mailService.sendMail(
        [userToNotify.email, driverToNotify.email],
        emailSubject,
        emailTextContent,
        emailHtmlContent,
      );
    }

    return plainToInstance(RideResponseDto, rideResponse);
  }
}

import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserActiveInterface } from "../common/interfaces/user-active.interface";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Review } from "./entities/review.entity";
import { User } from "../users/entities/user.entity";
import { Ride } from "../rides/entities/ride.entity";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userLogin: UserActiveInterface,
  ) {
    const user = await this.userRepository.findOneBy({
      id: createReviewDto.user_id,
    });
    if (!user) {
      throw new BadRequestException("User is not valid.");
    }
    const driver = await this.userRepository.findOneBy({
      id: createReviewDto.driver_id,
    });
    if (!driver) {
      throw new BadRequestException("Driver is not valid.");
    }
    const ride = await this.rideRepository.findOneBy({
      id: createReviewDto.ride_id,
    });
    if (!ride) {
      throw new BadRequestException("Ride is not valid.");
    }

    const reviewExist = await this.reviewRepository.findOneBy({
      ride: ride,
      driver: driver,
      user: user,
    });
    if (reviewExist) {
      throw new BadRequestException("Review was created previously.");
    }

    let review = await this.reviewRepository.save({
      ...createReviewDto,
      driver: driver,
      ride: ride,
      user: user,
    });

    await this.rideRepository.update(ride.id, {
      ...ride,
      review_id: review.id,
    });

    review.ride.review_id = review.id;

    return review;
  }

  async findOne(id: number) {
    return await this.reviewRepository.findOneBy({
      id: id,
    });
  }
}

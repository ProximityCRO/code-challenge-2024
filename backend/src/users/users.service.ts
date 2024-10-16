import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import { Review } from "../reviews/entities/review.entity";
import { Role } from "../common/enums/rol.enum";
import { plainToInstance } from "class-transformer";
import { UserProfileDto } from "./dto/user-profile.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  async profile(email: string) {
    let user = await this.userRepository.findOneBy({ email });
    let reviews = [];
    if (user.role === Role.DRIVER) {
      reviews = await this.reviewRepository.find({ where: { driver: user } });
    } else if (user.role === Role.USER) {
      reviews = await this.reviewRepository.find({ where: { user: user } });
    }

    const ratingAverage =
      reviews.length > 0
        ? Math.round(
            reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length,
          )
        : null;

    return plainToInstance(UserProfileDto, {
      id: user.id,
      email: user.email,
      name: user.name,
      phone_number: user.phone_number,
      role: user.role,
      vehicle: null,
      rating_average: ratingAverage,
      reviews: reviews,
    });
  }

  findByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ["id", "name", "email", "password", "role"],
    });
  }

  findAll() {
    return this.userRepository.find();
  }
}

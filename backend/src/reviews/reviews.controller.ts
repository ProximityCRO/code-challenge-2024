import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ActiveUser } from "src/common/decorators/active-user.decorator";
import { Role } from "src/common/enums/rol.enum";
import { UserActiveInterface } from "src/common/interfaces/user-active.interface";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Auth([Role.DRIVER, Role.USER])
@Controller("review")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(
    @Body() createOfferDto: CreateReviewDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.reviewsService.create(createOfferDto, user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.reviewsService.findOne(+id);
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';

@Auth([Role.DRIVER, Role.USER])
@Controller('ride')
export class RidesController {
  constructor(private readonly catsService: RidesService) {}

  @Post()
  create(@Body() createCatDto: CreateRideDto, @ActiveUser() user: UserActiveInterface) {
    return this.catsService.create(createCatDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    console.log(user);
    return this.catsService.findAll(user);
  }
}

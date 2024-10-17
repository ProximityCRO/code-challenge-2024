import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ActiveUser } from "src/common/decorators/active-user.decorator";
import { Role } from "src/common/enums/rol.enum";
import { UserActiveInterface } from "src/common/interfaces/user-active.interface";
import { RidesService } from "./rides.service";
import { CreateRideDto } from "./dto/create-ride.dto";
import { ValidationRideDto } from "./dto/validation-ride.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { OpenAIService } from "../common/openai/open-ai.service";
import { writeFileSync } from "fs";
import { join } from "path";

@Auth([Role.DRIVER, Role.USER])
@Controller("ride")
export class RidesController {
  constructor(
    private readonly ridesService: RidesService,
    private readonly openAiService: OpenAIService,
  ) {}

  @Post()
  create(
    @Body() createCatDto: CreateRideDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.ridesService.create(createCatDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.ridesService.findAll(user);
  }

  @Post("validation")
  validation(
    @Body() validationRideDto: ValidationRideDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.ridesService.validation(validationRideDto, user);
  }

  @Delete(":id")
  delete(
    @Param("id") ride_id: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.ridesService.delete(ride_id);
  }

  @Post("create-by-voice")
  @UseInterceptors(
    FileInterceptor("audio", { limits: { fileSize: 30 * 1024 * 1024 } }),
  )
  async createRideByVoice(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("No audio file uploaded");
    }
    const filePath = join(
      __dirname,
      "..",
      "..",
      "uploads",
      `${Date.now()}-${file.originalname}`,
    );
    writeFileSync(filePath, file.buffer);

    const rideData = await this.openAiService.transcribeAudio(filePath);
    const jsonRideData = JSON.parse(rideData);
    return {
      message: "Ride structure created successfully by voice",
      jsonRideData,
    };
  }
}

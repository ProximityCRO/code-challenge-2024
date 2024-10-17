import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { RidesModule } from "./rides/rides.module";
import { OffersModule } from "./offers/offers.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { VehiclesModule } from "./vehicles/vehicles.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "mysqldb",
      port: 3306,
      username: "userA",
      password: "P@ssw0rd123",
      database: "mydatabase",
      autoLoadEntities: true,
      synchronize: true,
    }),
    RidesModule,
    OffersModule,
    ReviewsModule,
    UsersModule,
    VehiclesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

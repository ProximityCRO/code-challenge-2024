import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Ride } from "../../rides/entities/ride.entity";

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "driver_id", referencedColumnName: "id" })
  driver: User;

  @Column()
  driver_id: number;

  @ManyToOne(() => Ride)
  @JoinColumn({ name: "ride_id", referencedColumnName: "id" })
  ride: Ride;

  @Column()
  ride_id: number;

  @Column()
  price: number;

  @Column({ default: false })
  selected: boolean;
}

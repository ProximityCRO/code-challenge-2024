import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Status } from "../../common/enums/status.enum";

@Entity()
export class Ride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", default: Status.REQUESTED, enum: Status })
  status: Status;

  @Column({ nullable: true })
  pin: string;

  @Column({ type: "datetime" })
  scheduled_time: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  offer_id: number;

  @Column({ nullable: true })
  review_id: number;

  @Column()
  pickup_location: string;

  @Column()
  destination_location: string;
}

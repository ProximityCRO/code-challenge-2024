import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Ride } from "../../rides/entities/ride.entity";

@Entity()
export class Review {
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

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;

  @Column()
  user_id: number;

  @Column()
  rating: number;

  @Column({ nullable: true })
  comments: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
}

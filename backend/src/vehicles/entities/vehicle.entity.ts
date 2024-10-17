import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { IsInt, IsPositive } from "class-validator";

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "driver_id", referencedColumnName: "id" })
  driver: User;

  @Column()
  driver_id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  @IsInt()
  @IsPositive()
  year: number;

  @Column()
  color: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}

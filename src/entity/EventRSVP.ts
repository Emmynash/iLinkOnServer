import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Event } from './Event';
import { User } from './User';

@Entity()
export class EventRSVP {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User)
  public user: User;

  @ManyToOne((type) => Event)
  public event: Event;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

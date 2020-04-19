import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  OneToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Length, IsOptional, IsUrl } from 'class-validator';
import { Group } from './Group';
import { User } from './User';
import { Event } from './Event';

@Entity()
export class EventComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  profilePhoto: string;

  @Column({
    length: 240,
    nullable: false,
  })
  @Length(2, 240)
  public comment: string;

  @ManyToOne((type) => Event)
  event: Event;

  @ManyToOne((type) => User)
  public user: User;

  @JoinTable()
  public users: User[];

  @Column({ default: false })
  public deleted: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

export const eventCommentSchema = {
  comment: {
    type: 'string',
    required: true,
    example: 'A comment on event',
    description: 'Comment',
  },
};

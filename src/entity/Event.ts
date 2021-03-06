import {
  Entity,
  Column,
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
import { EventDate } from './EventDate';
import { EventRSVP } from './EventRSVP';
import { School } from './School';
import { EventComment } from './EventComment';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Event extends BaseEntity {
  @Column()
  @IsOptional()
  @IsUrl()
  public displayPhoto: string;

  @Column({
    length: 80,
  })
  @Length(1, 80)
  name: string;

  @Column({
    length: 240,
  })
  @Length(2, 240)
  @IsOptional()
  description: string;

  @Column({
    length: 240,
  })
  @Length(2, 240)
  @IsOptional()
  venue: string;

  @OneToMany((type) => EventDate, (date) => date.event, {
    eager: true,
  })
  @JoinTable()
  dates: EventDate[];

  @OneToMany((type) => EventRSVP, (rsvp) => rsvp.event, {
    eager: true,
  })
  @JoinTable()
  public eventMembers: EventRSVP[];

  @ManyToOne((type) => Group, { cascade: true })
  @JoinColumn()
  public group: Group;

  @ManyToOne((type) => User)
  @JoinColumn()
  public createdBy: User;

  @ManyToOne((type) => School, { lazy: true })
  school?: Promise<School> | School | number;

  @Column({ default: false })
  public deleted: boolean;

  @Column({ default: false })
  public isPublic: boolean;

  @Column({ default: true })
  public isActive: boolean;

  @OneToMany((type) => EventComment, (comment) => comment.event)
  public comments: EventComment[];

  @BeforeInsert()
  @BeforeUpdate()
  public preSave() {
    if (!this.displayPhoto) {
      this.displayPhoto =
        'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro';
    }
    // For now all groups are public
    this.isPublic = true;
  }
}

export const eventSchema = {
  displayPhoto: {
    type: 'string',
    required: false,
    example:
      'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro',
    description: 'Group display photo',
  },
  name: {
    type: 'string',
    required: true,
    example: 'CS 321',
    description: 'Group name',
  },
  description: {
    type: 'string',
    required: false,
    example: 'CS 321 description',
    description: 'Group description',
  },
  venue: {
    type: 'string',
    required: false,
    example: 'CS 321 description',
    description: 'Group description',
  },
  dates: {
    type: 'array',
    required: true,
    items: {
      type: 'object',
      example: {
        startDate: '2020-03-11T06:36:07.519Z',
        endDate: '2020-03-11T09:36:07.519Z',
      },
    },
  },
};

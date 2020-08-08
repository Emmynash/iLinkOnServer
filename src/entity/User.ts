import {
  Entity,
  Column,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import {
  Length,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsUrl,
} from 'class-validator';
import crypto from 'crypto';
import { config } from '@config';
import { GroupMember } from './GroupMember';
import { School } from './School';
import { Message } from './Message';
import { EventComment } from './EventComment';
import { EventRSVP } from './EventRSVP';
import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity {
  @Column({
    length: 255,
  })
  @IsOptional()
  @IsUrl()
  profilePhoto: string;

  @Column({
    length: 80,
    nullable: false,
  })
  @Length(2, 80)
  fName: string;

  @Column({
    length: 80,
  })
  @Length(2, 80)
  lName: string;

  @Column({
    length: 80,
  })
  @Length(0, 80)
  @IsOptional()
  mName?: string;

  @Column({
    length: 100,
  })
  @Length(8, 100)
  @IsOptional()
  email?: string;

  @Column({
    length: 14,
    nullable: false,
  })
  @IsPhoneNumber('ZZ')
  phone: string;

  @ManyToOne((type) => School, { eager: true })
  school?: School;

  @Column({ type: 'numeric', array: true, default: '{}' })
  public interests: number[];

  @OneToMany((type) => GroupMember, (groupMember) => groupMember.member)
  public groupMembers: GroupMember[];

  @OneToMany((type) => Message, (message) => message.sender)
  public sentMessages: Message[];

  @OneToMany((type) => Message, (message) => message.sender)
  public receivedMessages: Message[];

  @OneToMany((type) => EventComment, (comment) => comment.user)
  public comments: EventComment[];

  @OneToMany((type) => EventRSVP, (eventRSVP) => eventRSVP.user)
  public eventRSVPS: EventRSVP[];

  @BeforeInsert()
  @BeforeUpdate()
  public preSave(size: number = 200) {
    if (!this.profilePhoto) {
      if (!this.phone) {
        this.profilePhoto = `https://gravatar.com/avatar/?s=${size}&d=retro`;
      }

      const md5 = crypto.createHash('md5').update(this.phone).digest('hex');
      this.profilePhoto = `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
    }
    if (!this.email) {
      this.email = `user-${this.id}@${config.presentationalDomain}`;
    }
  }
}

export const userSchema = {
  profilePhoto: {
    type: 'string',
    required: true,
    example:
      'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro',
  },
  fName: { type: 'string', required: true, example: 'Kator' },
  mName: { type: 'string', required: false, example: 'Akita' },
  lName: { type: 'string', required: true, example: 'James' },
  email: { type: 'string', required: false, example: 'e.akita91@gmail.com' },
  interests: {
    type: 'array',
    required: false,
    items: { type: 'number', example: 1 },
  },
  school: {
    type: 'number',
    required: false,
    example: 1,
    description: 'School ID',
  },
};

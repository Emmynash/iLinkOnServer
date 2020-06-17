import { Entity, Column } from 'typeorm';
import { Length, IsPhoneNumber } from 'class-validator';

import { config } from '@config';
import { BaseEntity } from './BaseEntity';

@Entity()
export class OneTimePassword extends BaseEntity {
  @Column({
    length: 14,
    nullable: false,
    unique: true,
  })
  // @IsPhoneNumber('ZZ')
  phone: string;

  @Column({
    length: config.OTPLength,
    nullable: false,
  })
  @Length(config.OTPLength)
  otp: string;
}

export const otpSchema = {
  phone: {
    type: 'string',
    required: true,
    example: '+2348181484568',
    description: 'Phone number requesting OTP',
  },
  otp: {
    type: 'string',
    required: true,
    example: '1234',
    description: 'OTP sent',
  },
};

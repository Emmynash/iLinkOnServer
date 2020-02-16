import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Length, IsPhoneNumber } from 'class-validator';
import { config } from '@config';

@Entity()
export class OneTimePassword {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 14,
        nullable: false,
        unique: true,
    })
    @IsPhoneNumber('ZZ')
    phone: string;

    @Column({
        length: config.OTPLength,
        nullable: false,
    })
    @Length(config.OTPLength)
    otp: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}

export const otpSchema = {
    phone: { type: 'string', required: true, example: '+2348181484568', description: 'Phone number requesting OTP' },
    otp: { type: 'string', required: true, example: '1234', description: 'OTP sent' },
};

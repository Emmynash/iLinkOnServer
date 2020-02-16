import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Length, IsEmail, IsPhoneNumber } from 'class-validator';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 80
    })
    @Length(2, 80)
    fName: string;

    @Column({
        length: 80
    })
    @Length(2, 80)
    lName: string;

    @Column({
        length: 80,
    })
    @Length(2, 80)
    mName: string;

    @Column({
        length: 100
    })
    @Length(10, 100)
    @IsEmail()
    email: string;

    @Column({
        length: 14,
    })
    @IsPhoneNumber('ZZ')
    phone: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}

export const userSchema = {
    id: { type: 'number', required: true, example: 1 },
    fName: { type: 'string', required: true, example: 'Kator' },
    mName: { type: 'string', required: false, example: 'Bryan' },
    lName: { type: 'string', required: true, example: 'James' },
    email: { type: 'string', required: false, example: 'kator95@gmail.com' },
};

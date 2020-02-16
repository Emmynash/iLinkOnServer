import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Length, IsEmail, IsPhoneNumber } from 'class-validator';
import { Interest } from './Interest';
import { GroupMember } from './GroupMember';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(10, 800)
    profilePhoto?: string;

    @Column({
        length: 80,
        nullable: false,
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
        length: 100,
    })
    @Length(8, 100)
    @IsEmail()
    email?: string;

    @Column({
        length: 14,
        nullable: false,
    })
    @IsPhoneNumber('ZZ')
    phone: string;

    @Column({ type: 'numeric', array: true, default: '{}' })
    public interests: number[];

    @OneToMany(type => GroupMember, groupMember => groupMember.member)
    public groupMembers: GroupMember[];

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

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Length, IsEmail, IsPhoneNumber, IsOptional } from 'class-validator';
import crypto from 'crypto';
import { config } from '@config';
import { GroupMember } from './GroupMember';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(10, 800)
    @IsOptional()
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
    @IsOptional()
    mName?: string;

    @Column({
        length: 100,
    })
    @Length(8, 100)
    @IsEmail()
    @IsOptional()
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
    fName: { type: 'string', required: true, example: 'Kator' },
    mName: { type: 'string', required: false, example: 'Bryan' },
    lName: { type: 'string', required: true, example: 'James' },
    email: { type: 'string', required: false, example: 'kator95@gmail.com' },
    interests: {
        type: 'array',
        required: false,
        items: { type: 'number', example: 1 },
    },
    school: {
        type: 'number',
        required: false,
        example:  1,
        description: 'School ID'
    },
};

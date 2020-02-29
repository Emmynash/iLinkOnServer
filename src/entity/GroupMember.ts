import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Length, IsPhoneNumber } from 'class-validator';
import { User } from './User';
import { Group } from './Group';

export enum UserRole {
    ADMIN = 'admin',
    MEMBER = 'member',
    GUEST = 'guest',
}


@Entity()
export class GroupMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    public userId: number;

    @Column()
    public groupId: number;

    @Column({ default: false })
    public approved: boolean;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
    public role: UserRole;

    @ManyToOne(type => User, user => user.groupMembers)
    public member: User;

    @ManyToOne(type => Group, group => group.groupMembers)
    public group: Group;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}

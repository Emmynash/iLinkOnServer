import { Entity, ManyToOne, Column, Index } from 'typeorm';

import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
export class NotificationToken extends BaseEntity {
    @Column()
    public userId: number;

    @ManyToOne(type => User)
    public user: User;

    @Index()
    @Column('text', {
        unique: true,
    })
    public token: string;
}

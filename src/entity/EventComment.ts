import {
    Entity,
    Column,
    JoinTable,
    ManyToOne,
} from 'typeorm';
import { Length, IsOptional, IsUrl } from 'class-validator';

import { User } from './User';
import { Event } from './Event';
import { BaseEntity } from './BaseEntity';

@Entity()
export class EventComment extends BaseEntity {
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
}

export const eventCommentSchema = {
    comment: {
        type: 'string',
        required: true,
        example: 'A comment on event',
        description: 'Comment',
    },
};

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, JoinColumn, OneToMany, JoinTable, ManyToOne } from 'typeorm';
import { Length, IsOptional, IsUrl } from 'class-validator';
import { Group } from './Group';
import { User } from './User';
import { Event } from './Event';

@Entity()
export class EventComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 240,
        nullable: false,
    })
    @Length(2, 240)
    comment: string;

    @ManyToOne(type => Event)
    event: Event;

    @ManyToOne(type => User)
    public user: User;

    @Column({ default: false })
    public deleted: boolean;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}

export const eventCommentSchema = {
    comment: { type: 'string', required: true, example: 'A comment on event', description: 'Comment' },
};

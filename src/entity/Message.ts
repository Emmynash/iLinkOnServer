import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Group } from './Group';
import { MessageThread } from './MessageThread';

@Entity()
export class Message extends BaseEntity {
    @Column()
    public text: string;

    @ManyToOne(type => User, user => user.sentMessages)
    sender: User;

    @ManyToOne(type => MessageThread)
    public thread: MessageThread;
}

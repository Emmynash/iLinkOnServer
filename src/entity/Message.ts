import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Group } from './Group';

@Entity()
export class Message extends BaseEntity {
    @Column()
    public text: string;

    @ManyToOne(type => User, user => user.sentMessages)
    sender: User;

    @ManyToOne(type => User, user => user.receivedMessages)
    public receiver: User;

    @ManyToOne(type => Group, group => group.messages, {
        onDelete: 'CASCADE',
    })
    public group: Group;
}

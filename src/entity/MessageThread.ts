import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Group } from './Group';
import { Message } from './Message';
import { MessageThreadParticipant } from './MessageThreadParticipant';

@Entity()
export class MessageThread extends BaseEntity {
    @Column({
        nullable: true,
    })
    public groupId: number;

    @OneToMany(type => Message, message => message.thread)
    messages: Message[];

    @OneToMany(type => MessageThreadParticipant, participant => participant.thread)
    public participants: User[];

    @OneToOne(type => Group, group => group.messageThreads, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    public group: Group;
}

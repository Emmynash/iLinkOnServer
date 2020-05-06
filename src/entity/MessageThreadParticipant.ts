import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { MessageThread } from './MessageThread';

@Entity()
export class MessageThreadParticipant extends BaseEntity {

    @Column({
        nullable: true,
    })
    public participantId: number;

    @ManyToOne(type => MessageThread, thread => thread.participants)
    public thread: MessageThread;

    @ManyToOne(type => User, user => user.sentMessages)
    participant: User;
}

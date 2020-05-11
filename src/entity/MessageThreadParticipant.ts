import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { MessageThread } from './MessageThread';

@Entity()
export class MessageThreadParticipant extends BaseEntity {
  @Column()
  public participantId: number;

  @Column()
  public threadId: number;

  @ManyToOne((type) => MessageThread, (thread) => thread.participants)
  public thread: MessageThread;

  @ManyToOne((type) => User, (user) => user.sentMessages, {
    eager: true,
  })
  participant: User;
}

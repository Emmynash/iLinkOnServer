import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { MessageThread } from './MessageThread';

export enum MessageStatus {
  READ = 'read',
  DELIVERED = 'delivered',
  SENT = 'sent',
}

@Entity()
export class Message extends BaseEntity {
  @Column()
  public text: string;

  @ManyToOne((type) => User, (user) => user.sentMessages, {
    eager: true,
  })
  sender: User;

  @ManyToOne((type) => MessageThread)
  public thread: MessageThread;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  public status: MessageStatus;
}

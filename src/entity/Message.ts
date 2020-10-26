import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsOptional } from 'class-validator';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { MessageThread } from './MessageThread';

export enum MessageStatus {
  READ = 'read',
  DELIVERED = 'delivered',
  SENT = 'sent',
}

export enum MessageType {
  AUDIO = 'audio',
  FILE = 'file',
  IMAGE = 'image',
  TEXT = 'text',
}

@Entity()
export class Message extends BaseEntity {
  @Column({ default: '' })
  @IsOptional()
  public text: string;

  @Column({ default: '' })
  @IsOptional()
  public audio: string;

  @Column({ default: '' })
  @IsOptional()
  public image: string;

  @Column({ default: '' })
  @IsOptional()
  public file: string;

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

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  public messageType: MessageType;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

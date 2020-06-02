import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Group } from './Group';
import { Message } from './Message';
import { MessageThreadParticipant } from './MessageThreadParticipant';

@Entity()
export class MessageThread extends BaseEntity {
  @Column({
    nullable: true,
  })
  public groupId: number;

  @OneToMany((type) => Message, (message) => message.thread)
  messages: Message[];

  @OneToMany(
    (type) => MessageThreadParticipant,
    (participant) => participant.thread,
    {
      eager: true,
      lazy: true,
    }
  )
  public participants: MessageThreadParticipant[];

  @OneToOne((type) => Group, (group) => group.messageThread, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  public group: Group;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate, JoinTable, AfterLoad } from 'typeorm';
import { Length, IsOptional, IsUrl } from 'class-validator';
import { GroupMember } from './GroupMember';
import { Event } from './Event';
import { BaseEntity } from './BaseEntity';
import { Message } from './Message';

@Entity()
export class Group extends BaseEntity {
    @Column({
        length: 255,
    })
    @IsOptional()
    @IsUrl()
    public displayPhoto: string;

    @Column({
        length: 255
    })
    @Length(2, 80)
    name: string;

    @Column({
        length: 240,
    })
    @Length(2, 240)
    @IsOptional()
    description: string;

    @Column({ type: 'numeric', array: true, default: '{}' })
    public interests: number[];

    @OneToMany(type => GroupMember, groupMember => groupMember.group, {
        eager: true
    })
    @JoinTable()
    public members: GroupMember[];

    @OneToMany(type => Event, event => event.group)
    public events: Event[];

    @OneToMany(type => Message, message => message.group)
    public messages: Message[];

    @Column({ default: false })
    public deleted: boolean;

    @Column({ default: false })
    public isPublic: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    public preSave() {
        if (!this.displayPhoto) {
            this.displayPhoto = 'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro';
        }
        // For now all groups are public
        this.isPublic = true;
    }

    public isMember?: boolean;
}

export const groupSchema = {
    displayPhoto: { type: 'string', required: false, example: 'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro', description: 'Group display photo' },
    name: { type: 'string', required: true, example: 'CS 321', description: 'Group name' },
    description: { type: 'string', required: false, example: 'CS 321 description', description: 'Group description' },
    interests: {
        type: 'array',
        required: false,
        items: { type: 'number', example: 1 },
    },
};

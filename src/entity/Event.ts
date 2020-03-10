import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToOne, JoinColumn, OneToMany, JoinTable } from 'typeorm';
import { Length, IsOptional, IsUrl, IsArray } from 'class-validator';
import { Group } from './Group';
import { User } from './User';
import { EventDate } from './EventDate';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsOptional()
    @IsUrl()
    public displayPhoto: string;

    @Column({
        length: 80
    })
    @Length(1, 80)
    name: string;

    @Column({
        length: 240,
    })
    @Length(2, 240)
    @IsOptional()
    description: string;

    @OneToMany(type => EventDate, date => date.event)
    @JoinTable()
    dates: EventDate[];

    @OneToOne(type => Group)
    @JoinColumn()
    public group: Group;

    @OneToOne(type => User)
    @JoinColumn()
    public createdBy: User;

    @Column({ default: false })
    public deleted: boolean;

    @Column({ default: false })
    public isPublic: boolean;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    public preSave() {
        if (!this.displayPhoto) {
            this.displayPhoto = 'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro';
        }
        // For now all groups are public
        this.isPublic = true;
    }
}

export const eventSchema = {
    displayPhoto: { type: 'string', required: false, example: 'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro', description: 'Group display photo' },
    name: { type: 'string', required: true, example: 'CS 321', description: 'Group name' },
    description: { type: 'string', required: false, example: 'CS 321 description', description: 'Group description' },
    dates: {
        type: 'array',
        required: false,
        items: {
            type: 'array',
            items: {
                type: 'object',
                example: {}
            },
        },
    },
};

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsDate } from 'class-validator';
import { Group } from './Group';
import { User } from './User';
import { Event } from './Event';

@Entity()
export class EventDate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsDate()
    startDate: Date;

    @Column()
    @IsDate()
    endDate: Date;

    @OneToMany(type => Event, event => event.dates)
    public event: Event;

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
        // For now all groups are public
        this.isPublic = true;
    }
}

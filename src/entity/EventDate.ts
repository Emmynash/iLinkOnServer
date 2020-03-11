import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsDate } from 'class-validator';
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

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}

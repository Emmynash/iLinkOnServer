import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
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

    @ManyToOne(type => Event, event => event.dates)
    public event: Event;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}

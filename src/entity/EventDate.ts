import { Entity, Column, ManyToOne } from 'typeorm';
import { IsDate } from 'class-validator';

import { Event } from './Event';
import { BaseEntity } from './BaseEntity';

@Entity()
export class EventDate extends BaseEntity {
    @Column()
    @IsDate()
    startDate: Date;

    @Column()
    @IsDate()
    endDate: Date;

    @ManyToOne(type => Event, event => event.dates)
    public event: Event;
}

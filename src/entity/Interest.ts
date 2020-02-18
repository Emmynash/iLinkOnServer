import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Length } from 'class-validator';

@Entity()
export class Interest {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({
        length: 24,
        unique: true,
    })
    @Length(1, 24)
    public name: string;

    @Column({
        default: true,
        nullable: false,
    })
    public isActive: boolean;
}

export const interestSchema = {
    name: { type: 'string', required: true, example: 'CS 321', description: 'Group name' },
};

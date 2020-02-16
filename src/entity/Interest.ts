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
        default: false,
        nullable: false,
    })
    public isActive: boolean;
}

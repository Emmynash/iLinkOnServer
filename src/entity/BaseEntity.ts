import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


export class BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @CreateDateColumn()
    public readonly createdAt: Date;

    @UpdateDateColumn()
    public readonly updatedAt: Date;
}

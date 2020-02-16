import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Length } from 'class-validator';
import { GroupMember } from './GroupMember';

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(10, 800)
    public profilePhoto: string;

    @Column({
        length: 80
    })
    @Length(2, 80)
    name: string;

    @Column({ type: 'numeric', array: true, default: '{}' })
    public interests: number[];

    @OneToMany(type => GroupMember, groupMember => groupMember.group)
    public groupMembers: GroupMember[];

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}

export const groupSchema = {
    name: { type: 'string', required: true, example: 'CS 321', description: 'Group name' },
};

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Length, IsOptional } from 'class-validator';
import { GroupMember } from './GroupMember';

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(10, 800)
    @IsOptional()
    public displayPhoto: string;

    @Column({
        length: 80
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

    @OneToMany(type => GroupMember, groupMember => groupMember.group)
    public groupMembers: GroupMember[];

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
    }
}

export const groupSchema = {
    displayPhoto: { type: 'string', required: false, example: 'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro', description: 'Group display photo' },
    name: { type: 'string', required: true, example: 'CS 321', description: 'Group name' },
    description: { type: 'string', required: false, example: 'CS 321 description', description: 'Group description' },
};

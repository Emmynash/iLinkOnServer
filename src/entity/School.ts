import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Length, IsOptional, IsUrl } from 'class-validator';
import crypto from 'crypto';

@Entity()
export class School {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 255,
    })
    @IsOptional()
    @IsUrl()
    public displayPhoto: string;

    @Column({
        length: 80
    })
    @Length(2, 80)
    name: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    public preSave() {
        const size = 200;
        if (!this.displayPhoto) {
            const md5 = crypto.createHash('md5').update(this.name).digest('hex');
            this.displayPhoto = `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
        }
    }
}

export const schoolSchema = {
    displayPhoto: { type: 'string', required: false, example: 'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro', description: 'School display photo' },
    name: { type: 'string', required: true, example: 'CS 321', description: 'Group name' },
};

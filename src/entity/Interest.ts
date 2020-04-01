import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Length, IsUrl } from 'class-validator';
import crypto from 'crypto';

@Entity()
export class Interest {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({
        length: 255,
    })
    @IsUrl()
    public displayPhoto: string;

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

export const interestSchema = {
    displayPhoto: { type: 'string', required: false, example: 'https://gravatar.com/avatar/02bf38fddbfe9f82b94203336f9ebc41?s=200&d=retro', description: 'Interest display photo' },
    name: { type: 'string', required: true, example: 'CS 321', description: 'Group name' },
};

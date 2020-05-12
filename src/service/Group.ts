import { Repository, getConnection, FindOneOptions } from 'typeorm';
import { Group } from '@entities';

export class GroupService  {

    private repository: Repository<Group>;

    constructor() {
        this.repository = getConnection().getRepository(Group);
    }

    public async getGroup(id: number, options?: FindOneOptions<Group>) {
        const group = await this.repository.findOne(id, options);
        return group;
    }
}

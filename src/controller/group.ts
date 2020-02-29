import { BaseContext } from 'koa';
import { getManager, Repository, Not, Equal, Like } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, path, body, responsesAll, tagsAll } from 'koa-swagger-decorator';
import { groupSchema, Group, GroupMember, UserRole } from '@entities';
import httpStatus = require('http-status');

@responsesAll({ 200: { description: 'success', }, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
@tagsAll(['Group'])
export default class UserController {

    @request('get', '/groups')
    @summary('Find all groups')
    public static async getGroups(ctx: BaseContext) {

        // get a group repository to perform operations with group
        const groupRepository: Repository<Group> = getManager().getRepository(Group);

        // load all groups
        const groups: Group[] = await groupRepository.find();

        // return OK status code and loaded groups array
        ctx.status = httpStatus.OK;
        ctx.state.data = groups;
    }

    @request('get', '/groups/{id}')
    @summary('Find group by id')
    @path({
        id: { type: 'number', required: true, description: 'id of group' }
    })
    public static async getGroup(ctx: BaseContext, next: () => void) {

        // get a group repository to perform operations with group
        const groupRepository: Repository<Group> = getManager().getRepository(Group);

        // load group by id
        const group: Group = await groupRepository.findOne(+ctx.params.id || 0);

        if (group) {
            // return OK status code and loaded group object
            ctx.status = httpStatus.OK;
            ctx.state.data = group;
            await next();
        } else {
            // return a BAD REQUEST status code and error message
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'The group you are trying to retrieve doesn\'t exist in the db';
            await next();
        }
    }

    @request('post', '/groups')
    @summary('Create a group')
    @body(groupSchema)
    public static async createGroup(ctx: BaseContext, next: () => void) {

        // get a group repository to perform operations with group
        const groupRepository: Repository<Group> = getManager().getRepository(Group);
        const groupMemberRepository: Repository<GroupMember> = getManager().getRepository(GroupMember);

        // build up entity group to be saved
        const groupToBeSaved: Group = new Group();
        groupToBeSaved.name = ctx.request.body.name;
        groupToBeSaved.description = ctx.request.body.description;
        groupToBeSaved.interests = ctx.request.body.interests ? ctx.request.body.interests : undefined;
        groupToBeSaved.displayPhoto = ctx.request.body.displayPhoto ? ctx.request.body.displayPhoto : undefined;

        // validate group entity
        const errors: ValidationError[] = await validate(groupToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = errors;
        } else if (await groupRepository.findOne({ name: groupToBeSaved.name })) {
            // return BAD REQUEST status code and name already exists error
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'A group already exists with the specified name';
        } else {
            // save the group contained in the POST body
            const group = await groupRepository.save(groupToBeSaved);

            // Create user group pivot entry
            const groupMember = new GroupMember();
            groupMember.member = ctx.state.user;
            groupMember.group = group;
            groupMember.role = UserRole.ADMIN;
            groupMember.approved = true;
            await groupMemberRepository.save(groupMember);

            // return CREATED status code and updated group
            ctx.status = httpStatus.CREATED;
            ctx.state.data = group;
            await next();
        }
    }

    @request('put', '/groups/{id}')
    @summary('Update a group')
    @path({
        id: { type: 'number', required: true, description: 'id of group' }
    })
    @body(groupSchema)
    public static async updateGroup(ctx: BaseContext, next: () => void) {

        // get a group repository to perform operations with group
        const groupRepository: Repository<Group> = getManager().getRepository(Group);

        // update the group by specified id
        // build up entity group to be updated
        const groupToBeUpdated: Group = new Group();
        groupToBeUpdated.id = +ctx.params.id || 0; // will always have a number, this will avoid errors
        groupToBeUpdated.name = ctx.request.body.name;
        groupToBeUpdated.displayPhoto = ctx.request.body.displayPhoto;

        // validate group entity
        const errors: ValidationError[] = await validate(groupToBeUpdated); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = errors;
            await next();
        } else if (!await groupRepository.findOne(groupToBeUpdated.id)) {
            // check if a group with the specified id exists
            // return a BAD REQUEST status code and error message
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'The group you are trying to update doesn\'t exist in the db';
            await next();
        } else if (await groupRepository.findOne({ id: Not(Equal(groupToBeUpdated.id)), name: groupToBeUpdated.name })) {
            // return BAD REQUEST status code and email already exists error
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'The specified e-mail address already exists';
            await next();
        } else {
            // save the group contained in the PUT body
            const group = await groupRepository.save(groupToBeUpdated);
            // return CREATED status code and updated group
            ctx.status = httpStatus.CREATED;
            ctx.state.data = group;
            await next();
        }

    }

    @request('delete', '/groups/{id}')
    @summary('Delete group by id')
    @path({
        id: { type: 'number', required: true, description: 'id of group' }
    })
    public static async deleteGroup(ctx: BaseContext, next: () => void) {

        // get a group repository to perform operations with user
        const groupRepository = getManager().getRepository(Group);

        // find the group by specified id
        const groupToRemove: Group = await groupRepository.findOne(+ctx.params.id || 0);
        if (!groupToRemove) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.state.message = 'The group you are trying to delete doesn\'t exist in the db';
        } else if (ctx.state.user.name !== groupToRemove.name) {
            // TODO Check if group is admin
            // check group's token id and group id are the same
            // if not, return a FORBIDDEN status code and error message
            ctx.status = 403;
            ctx.state.message = 'A group can only be deleted by the creator';
            await next();
        } else {
            // the group is there so can be removed
            groupToRemove.deleted;
            await groupRepository.save(groupToRemove);
            // return a NO CONTENT status code
            ctx.status = httpStatus.NO_CONTENT;
            await next();
        }

    }

    @request('post', '/groups/{id}/join')
    @summary('Join a group')
    @path({
        id: { type: 'number', required: true, description: 'id of group' }
    })
    public static async joinGroup(ctx: BaseContext, next: () => void) {

        // get a group repository to perform operations with group
        const groupRepository = getManager().getRepository(Group);
        const groupMemberRepository = getManager().getRepository(GroupMember);

        // find the group by specified id
        const groupToJoin: Group = await groupRepository.findOne(+ctx.params.id || 0);
        if (!groupToJoin) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.state.message = 'The group you are trying to join doesn\'t exist';
        } else if (!groupToJoin.isPublic) {
            // This is not a public group. A request may have to be sent to the admin
            // After which the flag `approved` will have to be set on GroupMember
            ctx.status = 403;
            ctx.state.message = 'A user can only be deleted by himself';
            await next();
        } else {
            // Create a groupMember
            const groupMember = new GroupMember();
            groupMember.member = ctx.state.user;
            groupMember.group = groupToJoin;
            groupMember.role = UserRole.MEMBER;
            groupMember.approved = true;
            await groupMemberRepository.save(groupMember);

            ctx.status = httpStatus.CREATED;
            ctx.state.data = groupToJoin;
            await next();
        }

    }
}

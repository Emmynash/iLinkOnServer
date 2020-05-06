import { BaseContext } from 'koa';
import { getManager } from 'typeorm';
import { request, summary, tagsAll, orderAll, middlewaresAll, securityAll, query, path, body } from 'koa-swagger-decorator';
import HttpStatus from 'http-status';
import { User, Message, GroupMember, MessageThread, MessageThreadParticipant } from '@entities';
import { config } from '@config';
import { authHandler } from '@middleware';

@orderAll(7)
@tagsAll(['Private Messaging'])
@middlewaresAll([authHandler()])
@securityAll([{ AuthorizationToken: [] }])
export default class AuthController {
    @request('get', '/messages')
    @query({
        page: { type: 'number', required: true, default: 1, description: 'Page number' },
        pageSize: { type: 'number', required: true, default: 1, description: 'Number of records per page' },
    })
    @summary('Get logged in user\'s message threads')
    public static async getUsersMessages(ctx: BaseContext, next: () => void) {
        const user: User = ctx.state.user;
        const groupMemberRepository = getManager().getRepository(GroupMember);
        const messageThreadRepository = getManager().getRepository(MessageThread);

        const groups = await groupMemberRepository.find({ member: user });
        const groupIds = groups.map((groupMember) => {
            return groupMember.groupId;
        });
        const page: number = (+(ctx.query.page) || 0) - 1;
        const pageSize: number = ctx.query.pageSize || config.pageSize;
        const messageThreads = await messageThreadRepository.createQueryBuilder('messageThread')
            .leftJoinAndSelect('messageThread.participants', 'participant')
            .where('participant.participantId = :userId', { userId: user.id })
            .orWhere('messageThread.groupId IN (:...groupIds)', { groupIds })
            .orderBy('messageThread.updatedAt', 'DESC')
            .skip(page * pageSize)
            .take(pageSize)
            .getMany();

        ctx.status = HttpStatus.OK;
        ctx.state.data = messageThreads;
        await next();
    }

    @request('get', '/messages/{threadId}')
    @path({
        threadId: { type: 'number', required: true, description: 'Message Thread ID' },
    })
    @query({
        page: { type: 'number', required: true, default: 1, description: 'Page number' },
        pageSize: { type: 'number', required: true, default: 1, description: 'Number of records per page' },
    })
    @summary('Get message thread messages')
    public static async GetThreadMessages(ctx: BaseContext, next: () => void) {
        const messageThreadRepository = getManager().getRepository(MessageThread);
        const messages = await messageThreadRepository.findOne(+ctx.params.threadId || 0, {
            relations: ['messages'],
            order: {
                updatedAt: 'DESC',
            },
        });

        ctx.status = HttpStatus.OK;
        ctx.state.data = messages;
        await next();
    }

    @request('post', '/messages')
    @body({
        userId: { type: 'number', required: false, default: 1, description: 'User ID' },
        groupId: { type: 'number', required: false, default: 1, description: 'Group ID' },
    })
    @summary('Create message thread')
    @summary('This action should happen before DM can begin')
    public static async CreateMessageThread(ctx: BaseContext, next: () => void) {
        const groupId = +ctx.request.body.groupId || 0;
        const userId = +ctx.request.body.groupId || 0;
        if (groupId || userId) {
            const messageThreadRepository = getManager().getRepository(MessageThread);
            const messageThread = new MessageThread();
            if (groupId) {
                messageThread.groupId = groupId;
            }

            await messageThreadRepository.save(messageThread);

            if (userId) {
                const messageThreadParticipantRepository = getManager().getRepository(MessageThreadParticipant);
                const firstParticipant = new MessageThreadParticipant();
                firstParticipant.participantId = ctx.state.user;
                firstParticipant.thread = messageThread;

                const secondParticipant = new MessageThreadParticipant();
                secondParticipant.participantId = userId;
                secondParticipant.thread = messageThread;
                await messageThreadParticipantRepository.save([firstParticipant, secondParticipant]);
            }

            ctx.status = HttpStatus.CREATED;
            ctx.state.data = {};
            await next();
        } else {
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = 'Group or user ID must be specified';
        }
    }
}

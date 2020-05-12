import { BaseContext } from 'koa';
import { getManager, getConnection } from 'typeorm';
import {
    request,
    summary,
    tagsAll,
    orderAll,
    middlewaresAll,
    securityAll,
    query,
    path,
    body,
} from 'koa-swagger-decorator';
import HttpStatus from 'http-status';
import {
    User,
    Message,
    GroupMember,
    MessageThread,
    MessageThreadParticipant,
    Group,
} from '@entities';
import { config } from '@config';
import { authHandler } from '@middleware';

@orderAll(7)
@tagsAll(['Private Messaging'])
@middlewaresAll([authHandler()])
@securityAll([{ AuthorizationToken: [] }])
export default class AuthController {
    @request('get', '/messages')
    @query({
        page: {
            type: 'number',
            required: true,
            default: 1,
            description: 'Page number',
        },
        pageSize: {
            type: 'number',
            required: true,
            default: 1,
            description: 'Number of records per page',
        },
    })
    @summary("Get logged in user's message threads")
    public static async getUsersMessages(ctx: BaseContext, next: () => void) {
        const user: User = ctx.state.user;
        const groupMemberRepository = getManager().getRepository(GroupMember);
        const messageThreadRepository = getManager().getRepository(MessageThread);

        const groups = await groupMemberRepository.find({ member: user });
        const groupIds = groups.map((groupMember) => {
            return groupMember.groupId;
        });
        const page: number = (+ctx.query.page || 0) - 1;
        const pageSize: number = ctx.query.pageSize || config.pageSize;
        const messageThreads = await messageThreadRepository
            .createQueryBuilder('messageThread')
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
        threadId: {
            type: 'number',
            required: true,
            description: 'Message Thread ID',
        },
    })
    @query({
        page: {
            type: 'number',
            required: true,
            default: 1,
            description: 'Page number',
        },
        pageSize: {
            type: 'number',
            required: true,
            default: 1,
            description: 'Number of records per page',
        },
    })
    @summary('Get message thread messages')
    public static async GetThreadMessages(ctx: BaseContext, next: () => void) {
        const messageThreadRepository = getManager().getRepository(MessageThread);
        const messages = await messageThreadRepository.findOne(
            +ctx.params.threadId || 0,
            {
                relations: ['messages'],
                order: {
                    updatedAt: 'DESC',
                },
            }
        );

        ctx.status = HttpStatus.OK;
        ctx.state.data = messages;
        await next();
    }

    @request('post', '/messages')
    @body({
        userId: {
            type: 'number',
            required: false,
            default: 1,
            description: 'User ID',
        },
        groupId: {
            type: 'number',
            required: false,
            default: 1,
            description: 'Group ID',
        },
    })
    @summary('Create message thread')
    @summary('This action should happen before DM can begin')
    public static async CreateMessageThread(ctx: BaseContext, next: () => void) {
        const groupId = +ctx.request.body.groupId || undefined;
        const userId = +ctx.request.body.userId || undefined;
        try {
            if (groupId || userId) {
                const messageThreadParticipantRepository = getManager().getRepository(
                    MessageThreadParticipant
                );
                const messageThreadRepository = getManager().getRepository(MessageThread);
                const userThreads = await messageThreadParticipantRepository.find({
                    where: {
                        participantId: ctx.state.user.id,
                    },
                    relations: ['thread'],
                });
                let result: MessageThread = undefined;
                if (userId) {
                    let existingThread: MessageThread = undefined;
                    for (let i = 0; i < userThreads.length; i++) {
                        const query = await messageThreadParticipantRepository.findOne({
                            where: {
                                participantId: userId,
                                threadId: userThreads[i].threadId,
                            },
                        });
                        if (query) {
                            existingThread = userThreads[i].thread;
                            break;
                        }
                    }
                    if (existingThread) {
                        result = existingThread;
                        result.participants = await existingThread.participants;
                    } else {
                        const messageThread = new MessageThread();
                        await messageThreadRepository.save(messageThread);

                        const firstParticipant = new MessageThreadParticipant();
                        firstParticipant.participantId = ctx.state.user;
                        firstParticipant.threadId = messageThread.id;

                        const secondParticipant = new MessageThreadParticipant();
                        secondParticipant.participantId = userId;
                        secondParticipant.threadId = messageThread.id;
                        const participants = await messageThreadParticipantRepository.save(
                            [firstParticipant, secondParticipant]
                        );
                        result = messageThread;
                        result.participants = participants;
                    }
                } else {
                    const groupRepository = getConnection().getRepository(Group);
                    const group = await groupRepository.findOne(+groupId || 0);
                    if (!group) {
                        throw new Error('Group does not exist');
                    }
                    let existingThread: MessageThread = undefined;
                    for (let i = 0; i < userThreads.length; i++) {
                        const query = await messageThreadRepository.findOne({
                            where: {
                                groupId: groupId,
                                threadId: userThreads[i].threadId,
                            },
                        });
                        if (query) {
                            existingThread = query;
                            break;
                        }
                    }
                    if (existingThread) {
                        result = existingThread;
                    } else {
                        const messageThread = new MessageThread();
                        messageThread.groupId = groupId;
                        await messageThreadRepository.save(
                            messageThread
                        );
                        result = messageThread;
                    }
                    result.group = group;
                }
                ctx.status = HttpStatus.OK;
                ctx.state.data = result || {};
            } else {
                throw new Error('Group or user ID must be specified');
            }
        } catch (error) {
            console.log(error);
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = error.message || 'Something went wrong and your request could not be completed';
        }
        await next();
    }
}

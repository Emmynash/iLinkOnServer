import { BaseContext } from 'koa';
import { getManager, getConnection, Repository } from 'typeorm';
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
    messageThreads.reverse();
    ctx.status = HttpStatus.OK;
    ctx.state.data = messageThreads;

    await next();
  }

  @request('get', '/messagethreads')
  @summary('Find all Logged in user messagethread')
  public static async getUserMessageThread(ctx: BaseContext, next: () => void) {
    const user: User = ctx.state.user;
    // get a messagethread repository to perform operations with event
    const messageThreadParticipantRepository: Repository<MessageThreadParticipant> = getManager().getRepository(
      MessageThreadParticipant
    );

    // load logeed in user messagethread
    const messages: MessageThreadParticipant[] = await messageThreadParticipantRepository
      .createQueryBuilder('messageThreadParticipant')
      .where('messageThreadParticipant.participantId = :userId', {
        userId: user.id,
      })
      .orWhere('messageThreadParticipant.secondParticipantId = :userId', {
        userId: user.id,
      })
      .orderBy('messageThreadParticipant.updatedAt', 'DESC')
      .getMany();

    const data = messages.filter((message) => {
      return message.secondParticipantfName !== ctx.state.user.fName;
    });

    data.reverse();
    // return OK status code and loaded messagethread array
    ctx.status = HttpStatus.OK;
    ctx.state.data = data;

    console.log(data);
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
        const messageThreadRepository = getManager().getRepository(
          MessageThread
        );
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

            // get a user repository to perform operations with user
            const userRepository: Repository<User> = getManager().getRepository(
              User
            );
            // load second participant by id
            const user: User = await userRepository.findOne(userId);

            const firstParticipant = new MessageThreadParticipant();
            firstParticipant.participantId = ctx.state.user;
            firstParticipant.threadId = messageThread.id;
            firstParticipant.secondParticipantId = user.id;
            firstParticipant.secondParticipantfName = user.fName;
            firstParticipant.secondParticipantProfilepic = user.profilePhoto;

            const secondParticipant = new MessageThreadParticipant();
            secondParticipant.participantId = userId;
            secondParticipant.threadId = messageThread.id;
            secondParticipant.secondParticipantfName = ctx.state.user.fName;
            secondParticipant.secondParticipantProfilepic =
              ctx.state.user.profilePhoto;
            secondParticipant.secondParticipantId = ctx.state.user.id;
            const participants = await messageThreadParticipantRepository.save([
              firstParticipant,
              secondParticipant,
            ]);
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
            await messageThreadRepository.save(messageThread);
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
      ctx.state.message =
        error.message ||
        'Something went wrong and your request could not be completed';
    }
    await next();
  }
}

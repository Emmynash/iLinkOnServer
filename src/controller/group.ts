import { BaseContext } from 'koa';
import { getManager, Repository, Not, Equal } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import {
  request,
  summary,
  path,
  body,
  responsesAll,
  tagsAll,
  middlewaresAll,
  responses,
  orderAll,
  securityAll,
} from 'koa-swagger-decorator';
import {
  groupSchema,
  Group,
  GroupMember,
  UserRole,
  eventSchema,
  Event,
  EventDate,
  School,
  EventRSVP,
} from '@entities';
import httpStatus from 'http-status';
import { authHandler } from '@middleware';
import { SampleResponses } from '@shared';
import { reverse } from 'dns';

@orderAll(4)
@responsesAll({
  [httpStatus.OK]: { description: 'success' },
  [httpStatus.BAD_REQUEST]: { description: 'bad request' },
  [httpStatus.UNAUTHORIZED]: {
    description: 'unauthorized, missing/wrong jwt token',
  },
})
@tagsAll(['Group'])
@middlewaresAll([authHandler()])
@securityAll([{ AuthorizationToken: [] }])
export default class GroupController {
  @request('get', '/groups')
  @summary('Find all groups')
  public static async getAll(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository: Repository<Group> = getManager().getRepository(
      Group
    );

    // load all groups
    const groups: Group[] = await groupRepository.find({ deleted: false });
    groups.forEach((group) => {
      const groupMember = group.members.find((member) => {
        return member.memberId === ctx.state.user.id;
      });
      if (groupMember) {
        group.isMember = true;
        if (groupMember.role === 'admin') {
          group.role = 'admin';
        } else {
          group.role = 'member';
        }
      } else {
        group.isMember = false;
      }
    });

    // reverse groups array
    groups.reverse();

    // return OK status code and loaded groups array
    ctx.status = httpStatus.OK;
    ctx.state.data = groups;
    await next();
  }

  @request('get', '/groups/schools/{schoolId}')
  @summary('Find all groups in schools')
  @path({
    schoolId: { type: 'number', required: true, description: 'School id' },
  })
  public static async getAllGroupsInSchool(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository: Repository<Group> = getManager().getRepository(
      Group
    );
    // get a school repository to perform operations with school
    const schoolRepository: Repository<School> = getManager().getRepository(
      School
    );
    // load school by id
    const school: School = await schoolRepository.findOne(
      ctx.state.user.school || +ctx.params.schoolId
    );
    // load all groups
    const groups: Group[] = await groupRepository.find({ school: school.id });

    groups.forEach((group) => {
      const groupMember = group.members.find((member) => {
        return member.memberId === ctx.state.user.id;
      });
      if (groupMember) {
        group.isMember = true;
        if (groupMember.role === 'admin') {
          group.role = 'admin';
        } else {
          group.role = 'member';
        }
      } else {
        group.isMember = false;
      }
    });

    // reverse groups array
    groups.reverse();

    // return OK status code and loaded groups array
    ctx.status = httpStatus.OK;
    ctx.state.data = groups;
    await next();
  }

  @request('get', '/groups/{groupId}')
  @summary('Find group by id')
  @path({
    groupId: { type: 'number', required: true, description: 'id of group' },
  })
  public static async getGroup(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository: Repository<Group> = getManager().getRepository(
      Group
    );

    // load group by id
    const group: Group = await groupRepository.findOne(
      +ctx.params.groupId || 0
    );

    if (group) {
      // return OK status code and loaded group object
      ctx.status = httpStatus.OK;
      ctx.state.data = group;
    } else {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message =
        "The group you are trying to retrieve doesn't exist in the db";
    }
    await next();
  }

  @request('post', '/groups')
  @summary('Create a group')
  @body(groupSchema)
  public static async createGroup(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository: Repository<Group> = getManager().getRepository(
      Group
    );
    const groupMemberRepository: Repository<GroupMember> = getManager().getRepository(
      GroupMember
    );

    // build up entity group to be saved
    const groupToBeSaved: Group = new Group();
    groupToBeSaved.name = ctx.request.body.name;
    groupToBeSaved.description = ctx.request.body.description;
    groupToBeSaved.interests = ctx.request.body.interests;
    groupToBeSaved.school = ctx.request.body.school;
    groupToBeSaved.displayPhoto = ctx.request.body.displayPhoto;
    // groupToBeSaved.role = UserPerm.ADMIN;

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
      groupMember.profilePhoto = ctx.state.user.profilePhoto;
      await groupMemberRepository.save(groupMember);

      // return CREATED status code and updated group
      ctx.status = httpStatus.CREATED;
      ctx.state.data = group;
    }
    await next();
  }

  @request('put', '/groups/{groupId}')
  @summary('Update a group')
  @path({
    groupId: { type: 'number', required: true, description: 'Group ID' },
  })
  @body(groupSchema)
  public static async updateGroup(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository: Repository<Group> = getManager().getRepository(
      Group
    );

    // update the group by specified id
    // build up entity group to be updated
    const groupToBeUpdated: Group = new Group();
    groupToBeUpdated.id = +ctx.params.groupId || 0; // will always have a number, this will avoid errors
    groupToBeUpdated.name = ctx.request.body.name;
    groupToBeUpdated.displayPhoto = ctx.request.body.displayPhoto;

    // validate group entity
    const errors: ValidationError[] = await validate(groupToBeUpdated); // errors is an array of validation errors

    if (errors.length > 0) {
      // return BAD REQUEST status code and errors array
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message = errors;
    } else if (!(await groupRepository.findOne(groupToBeUpdated.id))) {
      // check if a group with the specified id exists
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.NOT_FOUND;
      ctx.state.message =
        "The group you are trying to update doesn't exist in the db";
    } else if (
      await groupRepository.findOne({
        id: Not(Equal(groupToBeUpdated.id)),
        name: groupToBeUpdated.name,
      })
    ) {
      // return BAD REQUEST status code and email already exists error
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message = 'The specified group name already exists';
    } else {
      // save the group contained in the PUT body
      const group = await groupRepository.save(groupToBeUpdated);
      // return CREATED status code and updated group
      ctx.status = httpStatus.CREATED;
      ctx.state.data = group;
    }
    await next();
  }

  @request('delete', '/groups/{groupId}')
  @summary('Delete group by id')
  @path({
    groupId: { type: 'number', required: true, description: 'id of group' },
  })
  public static async deleteGroup(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with user
    const groupRepository = getManager().getRepository(Group);

    // find the group by specified id
    const groupToRemove: Group = await groupRepository.findOne(
      +ctx.params.groupId || 0
    );
    if (!groupToRemove) {
      // return a BAD REQUEST status code and error message
      ctx.status = 400;
      ctx.state.message =
        "The group you are trying to delete doesn't exist in the db";
    } else if (ctx.state.user.name !== groupToRemove.name) {
      // TODO Check if group is admin
      // check group's token id and group id are the same
      // if not, return a FORBIDDEN status code and error message
      ctx.status = 403;
      ctx.state.message = 'A group can only be deleted by the creator';
    } else {
      // the group is there so can be removed
      groupToRemove.deleted;
      await groupRepository.save(groupToRemove);
      // return a NO CONTENT status code
      ctx.status = httpStatus.NO_CONTENT;
    }
    await next();
  }

  @request('post', '/groups/{groupId}/join')
  @summary('Join a group')
  @path({
    groupId: { type: 'number', required: true, description: 'id of group' },
  })
  public static async joinGroup(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository = getManager().getRepository(Group);
    const groupMemberRepository = getManager().getRepository(GroupMember);

    // find the group by specified id
    const groupToJoin: Group = await groupRepository.findOne(
      +ctx.params.groupId || 0
    );
    if (!groupToJoin) {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message = "The group you are trying to join doesn't exist";
    } else if (!groupToJoin.isPublic) {
      // This is not a public group. A request may have to be sent to the admin
      // After which the flag `approved` will have to be set on GroupMember
      ctx.status = httpStatus.FORBIDDEN;
      ctx.state.message = 'A user can only be added by the admin';
    } else {
      // Create a groupMember
      const groupMember = new GroupMember();
      groupMember.member = ctx.state.user;
      groupMember.profilePhoto = ctx.state.user.profilePhoto;
      groupMember.group = groupToJoin;
      groupMember.role = UserRole.MEMBER;
      groupMember.approved = true;
      await groupMemberRepository.save(groupMember);

      ctx.status = httpStatus.CREATED;
      ctx.state.data = groupToJoin;
    }
    await next();
  }

  @request('post', '/groups/{groupId}/leave')
  @summary('Leave a group')
  @path({
    groupId: { type: 'number', required: true, description: 'Group ID' },
  })
  public static async exitGroup(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository = getManager().getRepository(Group);
    const groupMemberRepository = getManager().getRepository(GroupMember);

    // find the group by specified id
    const groupToExit: Group = await groupRepository.findOne(
      +ctx.params.groupId || 0
    );
    if (!groupToExit) {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.NOT_FOUND;
      ctx.state.message = "The group you are trying to leave doesn't exist";
    } else {
      // Create a groupMember
      await groupMemberRepository.delete({
        group: groupToExit,
        member: ctx.state.user,
      });

      ctx.status = httpStatus.OK;
    }
    await next();
  }

  @request('get', '/groups/{groupId}/members')
  @summary('Get group members')
  @path({
    groupId: { type: 'number', required: true, description: 'Group ID' },
  })
  @responses(SampleResponses.GetGroupMembers)
  public static async getMembers(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository = getManager().getRepository(Group);
    const groupMemberRepository = getManager().getRepository(GroupMember);

    // find the group by specified id
    const group: Group = await groupRepository.findOne(
      +ctx.params.groupId || 0
    );
    if (!group) {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.NOT_FOUND;
      ctx.state.message = "The group you are trying to retrieve doesn't exist";
    } else {
      // retrieve groupMembers
      const groupMembers = await groupMemberRepository.find({ group });
      ctx.status = httpStatus.OK;
      ctx.state.data = groupMembers;
    }
    await next();
  }

  @request('post', '/groups/{groupId}/events')
  @summary('Create a group event')
  @path({
    groupId: { type: 'number', required: true, description: 'id of group' },
  })
  @body(eventSchema)
  public static async createEvent(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository = getManager().getRepository(Group);
    const eventRepository = getManager().getRepository(Event);
    const eventDateRepository = getManager().getRepository(EventDate);
    const groupMemberRepository = getManager().getRepository(GroupMember);
    const eventRSVPRepository: Repository<EventRSVP> = getManager().getRepository(
      EventRSVP
    );

    // find the group by specified id
    const group: Group = await groupRepository.findOne(
      +ctx.params.groupId || 0
    );
    if (!group) {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message =
        "The group you are trying to create an event for doesn't exist";
    } else if (
      !(await groupMemberRepository.findOne({
        group,
        member: ctx.state.user,
        role: UserRole.ADMIN,
      }))
    ) {
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message = 'Only a group admin can create and event for a group';
    } else {
      // Create an event
      let event = new Event();
      event.displayPhoto = ctx.request.body.displayPhoto;
      event.name = ctx.request.body.name;
      event.venue = ctx.request.body.venue;
      event.group = group;
      event.description = ctx.request.body.description;
      event.createdBy = ctx.state.user;
      event.school = ctx.state.user.school;
      event = await eventRepository.save(event);

      // Create event dates
      const eventDates = ctx.request.body.dates.map(async (date) => {
        let eventDate = new EventDate();
        eventDate.startDate = new Date(date.startDate);
        eventDate.endDate = new Date(date.endDate || date.startDate);
        eventDate.event = event;
        eventDate = await eventDateRepository.save(eventDate);
        return eventDate;
      });

      // Create an RSVP
      const rsvp: EventRSVP = new EventRSVP();
      rsvp.user = ctx.state.user;
      rsvp.event = event;
      rsvp.memberId = ctx.state.user.id;

      await eventRSVPRepository.save(rsvp);

      ctx.status = httpStatus.OK;
      ctx.state.data = event;
    }
    await next();
  }

  @request('get', '/groups/{groupId}/events')
  @summary("Get a group's events")
  @path({
    groupId: { type: 'number', required: true, description: 'Group ID' },
  })
  public static async getEvents(ctx: BaseContext, next: () => void) {
    // get a group repository to perform operations with group
    const groupRepository = getManager().getRepository(Group);
    const eventRepository = getManager().getRepository(Event);

    // find the group by specified id
    const group: Group = await groupRepository.findOne(
      +ctx.params.groupId || 0
    );
    if (!group) {
      // return a BAD REQUEST status code and error message
      ctx.status = 400;
      ctx.state.message = "The group doesn't exist";
    } else {
      // Create an event
      const events = await eventRepository.find({ group });
      ctx.status = httpStatus.OK;
      ctx.state.data = events;
    }
    await next();
  }
}

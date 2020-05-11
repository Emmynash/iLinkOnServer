import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import {
  request,
  summary,
  path,
  body,
  responsesAll,
  tagsAll,
  middlewaresAll,
  orderAll,
  securityAll,
} from 'koa-swagger-decorator';
import { Event, EventRSVP, eventCommentSchema, EventComment } from '@entities';
import httpStatus = require('http-status');
import { authHandler } from '@middleware';

@orderAll(5)
@responsesAll({
  [httpStatus.OK]: { description: 'success' },
  [httpStatus.BAD_REQUEST]: { description: 'bad request' },
  [httpStatus.UNAUTHORIZED]: {
    description: 'unauthorized, missing/wrong jwt token',
  },
})
@tagsAll(['Event'])
@middlewaresAll([authHandler()])
@securityAll([{ AuthorizationToken: [] }])
export default class UserController {
  @request('get', '/events')
  @summary('Find all events')
  public static async getEvents(ctx: BaseContext, next: () => void) {
    // get a event repository to perform operations with event
    const eventRepository: Repository<Event> = getManager().getRepository(
      Event
    );

    // load all events
    const events: Event[] = await eventRepository.find();

    // reverse events array
    events.reverse();

    // return OK status code and loaded events array
    ctx.status = httpStatus.OK;
    ctx.state.data = events;
    await next();
  }

  @request('get', '/events/{eventId}')
  @summary('Get event details')
  @path({
    eventId: { type: 'number', required: true, description: 'Event ID' },
  })
  public static async getEvent(ctx: BaseContext, next: () => void) {
    // get a event repository to perform operations with event
    const eventRepository = getManager().getRepository(Event);
    const eventCommentRepository = getManager().getRepository(EventComment);

    // find the group by specified id
    const event: Event = await eventRepository.findOne(
      +ctx.params.eventId || 0
    );
    if (!event) {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.NOT_FOUND;
      ctx.state.message = "The event doesn't exist";
    } else {
      // Get all event comments
      const comments = await eventCommentRepository.find({ event });

      comments.reverse();

      ctx.status = httpStatus.OK;
      ctx.state.data = { ...event, comments };
    }
    await next();
  }

  @request('post', '/events/{eventId}/rsvp')
  @summary('RSVP an event')
  @path({
    eventId: { type: 'number', required: true, description: 'Event ID' },
  })
  public static async rsvpEvent(ctx: BaseContext, next: () => void) {
    // get a event repository to perform operations with event
    const eventRepository = getManager().getRepository(Event);
    const eventRSVPRepository: Repository<EventRSVP> = getManager().getRepository(
      EventRSVP
    );

    // find the event by specified id
    const event: Event = await eventRepository.findOne(
      +ctx.params.eventId || 0
    );

    // Create an RSVP
    const rsvp: EventRSVP = new EventRSVP();
    rsvp.user = ctx.state.user;
    rsvp.event = event;
    rsvp.memberId = ctx.state.user.id;

    if (!event) {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.NOT_FOUND;
      ctx.state.message = "The event you are trying to join doesn't exist";
      await next();
    } else if (await eventRSVPRepository.findOne({ user: ctx.state.user })) {
      // return BAD REQUEST status code and user already joined error
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message = 'The specified user is already attending this event';
      await next();
    } else if (!event.isPublic) {
      // This is not a public event. A request may have to be sent to the admin
      // After which the flag `approved` will have to be set on Event RSVP
      ctx.status = httpStatus.FORBIDDEN;
      ctx.state.message =
        'You cannot RSVP for a private event without a join code';
      await next();
    } else {
      const eventRSVP = await eventRSVPRepository.save(rsvp);

      ctx.status = httpStatus.CREATED;
      ctx.state.data = eventRSVP;
      await next();
    }
  }

  @request('get', '/events/{eventId}/rsvp')
  @summary('Get event RSVPs')
  @path({
    eventId: { type: 'number', required: true, description: 'Event ID' },
  })
  public static async getRsvps(ctx: BaseContext, next: () => void) {
    // get a event repository to perform operations with event
    const eventRepository = getManager().getRepository(Event);
    const eventRSVPRepository = getManager().getRepository(EventRSVP);

    // find the event by specified id
    const event: Event = await eventRepository.findOne(
      +ctx.params.eventId || 0
    );
    if (!event) {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.NOT_FOUND;
      ctx.state.message = "The event doesn't exist";
      await next();
    } else {
      // Create an RSVP
      const rsvps = await eventRSVPRepository.find({ relations: ['user'] });

      rsvps.reverse();

      ctx.status = httpStatus.OK;
      ctx.state.data = rsvps;
      await next();
    }
  }

  @request('post', '/events/{eventId}/comments')
  @summary('Create comment on')
  @path({
    eventId: { type: 'number', required: true, description: 'Event ID' },
  })
  @body(eventCommentSchema)
  public static async postComment(ctx: BaseContext, next: () => void) {
    // get a event repository to perform operations with event
    const eventRepository = getManager().getRepository(Event);
    const eventCommentRepository = getManager().getRepository(EventComment);

    const comment = new EventComment();
    comment.comment = ctx.request.body.comment;
    comment.profilePhoto = ctx.state.user.profilePhoto;

    // validate user entity
    const errors: ValidationError[] = await validate(comment); // errors is an array of validation errors

    if (errors.length > 0) {
      // return BAD REQUEST status code and errors array
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message = errors;
    } else {
      // find the group by specified id
      const event: Event = await eventRepository.findOne(
        +ctx.params.eventId || 0
      );
      if (!event) {
        // return a BAD REQUEST status code and error message
        ctx.status = httpStatus.BAD_REQUEST;
        ctx.state.message =
          "The event you are trying to comment on doesn't exist";
      } else {
        // Create an RSVP
        comment.event = event;
        comment.user = ctx.state.user;
        const createdComment = await eventCommentRepository.save(comment);
        ctx.status = httpStatus.CREATED;
        ctx.state.data = createdComment;
      }
    }
    await next();
  }
}

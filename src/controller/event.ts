import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, path, body, responsesAll, tagsAll } from 'koa-swagger-decorator';
import { Event, EventRSVP } from '@entities';
import httpStatus = require('http-status');

@responsesAll({ 200: { description: 'success', }, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
@tagsAll(['Event'])
export default class UserController {

    @request('get', '/events')
    @summary('Find all events')
    public static async getEvents(ctx: BaseContext, next: () => void) {

        // get a event repository to perform operations with event
        const eventRepository: Repository<Event> = getManager().getRepository(Event);

        // load all events
        const events: Event[] = await eventRepository.find();

        // return OK status code and loaded events array
        ctx.status = httpStatus.OK;
        ctx.state.data = events;
        await next();
    }

    @request('post', '/events/{eventId}/rsvp')
    @summary('RSVP an event')
    @path({
        eventId: { type: 'number', required: true, description: 'Event ID' }
    })
    public static async rsvpEvent(ctx: BaseContext, next: () => void) {

        // get a event repository to perform operations with event
        const eventRepository = getManager().getRepository(Event);
        const eventRSVPRepository = getManager().getRepository(EventRSVP);

        // find the group by specified id
        const event: Event = await eventRepository.findOne(+ctx.params.eventId || 0);
        if (!event) {
            // return a BAD REQUEST status code and error message
            ctx.status = httpStatus.NOT_FOUND;
            ctx.state.message = 'The group you are trying to join doesn\'t exist';
            await next();
        } else if (!event.isPublic) {
            // This is not a public group. A request may have to be sent to the admin
            // After which the flag `approved` will have to be set on Event RSVP
            ctx.status = httpStatus.FORBIDDEN;
            ctx.state.message = 'You cannot RSVP for a private event without a join code';
            await next();
        } else {
            // Create an RSVP
            const rsvp = new EventRSVP();
            rsvp.user = ctx.state.user;
            rsvp.event = event;
            await eventRSVPRepository.save(rsvp);

            ctx.status = httpStatus.CREATED;
            ctx.state.data = rsvp;
            await next();
        }
    }

    @request('get', '/events/{eventId}/rsvp')
    @summary('Get event RSVPs')
    @path({
        eventId: { type: 'number', required: true, description: 'Event ID' }
    })
    public static async getRsvps(ctx: BaseContext, next: () => void) {

        // get a event repository to perform operations with event
        const eventRepository = getManager().getRepository(Event);
        const eventRSVPRepository = getManager().getRepository(EventRSVP);

        // find the group by specified id
        const event: Event = await eventRepository.findOne(+ctx.params.eventId || 0);
        if (!event) {
            // return a BAD REQUEST status code and error message
            ctx.status = httpStatus.NOT_FOUND;
            ctx.state.message = 'The group you are trying to join doesn\'t exist';
            await next();
        } else {
            // Create an RSVP
            const rsvps = await eventRSVPRepository.find({ event });

            ctx.status = httpStatus.CREATED;
            ctx.state.data = rsvps;
            await next();
        }

    }
}

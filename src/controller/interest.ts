import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, path, body, responsesAll, tagsAll } from 'koa-swagger-decorator';
import { Interest, interestSchema } from '@entities';
import httpStatus from 'http-status';

@responsesAll({ 200: { description: 'success', }, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
@tagsAll(['Interest'])
export default class UserController {

    @request('get', '/interests')
    @summary('Find all interests')
    public static async getInterests(ctx: BaseContext, next: () => void) {

        // get a interest repository to perform operations with interest
        const interestRepository: Repository<Interest> = getManager().getRepository(Interest);

        // load all interests
        const interests: Interest[] = await interestRepository.find();

        // return OK status code and loaded interests array
        ctx.status = httpStatus.OK;
        ctx.state.data = interests;
        await next();
    }

    @request('post', '/interests')
    @summary('Create an interest')
    @body(interestSchema)
    public static async createInterest(ctx: BaseContext, next: () => void) {

        // get a interest repository to perform operations with interest
        const interestRepository: Repository<Interest> = getManager().getRepository(Interest);

        // build up entity interest to be saved
        const interestToBeSaved: Interest = new Interest();
        interestToBeSaved.name = ctx.request.body.name;

        // validate interest entity
        const errors: ValidationError[] = await validate(interestToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = errors;
        } else if (await interestRepository.findOne({ name: interestToBeSaved.name })) {
            // return BAD REQUEST status code and name already exists error
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'The specified name already exists';
        } else {
            // save the interest contained in the POST body
            const interest = await interestRepository.save(interestToBeSaved);
            // return CREATED status code and updated interest
            ctx.status = httpStatus.CREATED;
            ctx.state.data = interest;
            await next();
        }
    }

    @request('delete', '/interests/{id}')
    @summary('Delete an interest by id')
    @path({
        id: { type: 'number', required: true, description: 'id of interest' }
    })
    public static async deleteInterest(ctx: BaseContext, next: () => void) {

        // get a interest repository to perform operations with interest
        const interestRepository = getManager().getRepository(Interest);

        // find the user by specified id
        const schoolToRemove: Interest = await interestRepository.findOne(+ctx.params.id || 0);
        if (!schoolToRemove) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.state.message = 'The user you are trying to delete doesn\'t exist in the db';
        } else {
            // the user is there so can be removed
            await interestRepository.remove(schoolToRemove);
            // return a NO CONTENT status code
            ctx.status = httpStatus.NO_CONTENT;
            await next();
        }
    }
}

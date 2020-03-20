import { BaseContext } from 'koa';
import { getManager, Repository, Not, Equal } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, path, body, responsesAll, tagsAll, middlewaresAll } from 'koa-swagger-decorator';
import { schoolSchema, School } from '@entities';
import httpStatus = require('http-status');
import { authHandler } from '@middleware';

@responsesAll({ 200: { description: 'success', }, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
@tagsAll(['School'])
@middlewaresAll([authHandler()])
export default class UserController {

    @request('get', '/schools')
    @summary('Find all schools')
    public static async getSchools(ctx: BaseContext, next: () => void) {

        // get a school repository to perform operations with school
        const schoolRepository: Repository<School> = getManager().getRepository(School);

        // load all schools
        const schools: School[] = await schoolRepository.find();

        // return OK status code and loaded schools array
        ctx.status = httpStatus.OK;
        ctx.state.data = schools;
        await next();
    }

    @request('get', '/schools/{schoolId}')
    @summary('Find school by id')
    @path({
        schoolId: { type: 'number', required: true, description: 'id of school' }
    })
    public static async getSchool(ctx: BaseContext, next: () => void) {

        // get a school repository to perform operations with school
        const schoolRepository: Repository<School> = getManager().getRepository(School);

        // load school by id
        const school: School = await schoolRepository.findOne(+ctx.params.schoolId || 0);

        if (school) {
            // return OK status code and loaded school object
            ctx.status = httpStatus.OK;
            ctx.state.data = school;
            await next();
        } else {
            // return a BAD REQUEST status code and error message
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'The school you are trying to retrieve doesn\'t exist in the db';
            await next();
        }

    }

    @request('post', '/schools')
    @summary('Create a school')
    @body(schoolSchema)
    public static async createSchool(ctx: BaseContext, next: () => void) {

        // get a school repository to perform operations with school
        const schoolRepository: Repository<School> = getManager().getRepository(School);

        // build up entity school to be saved
        const schoolToBeSaved: School = new School();
        schoolToBeSaved.name = ctx.request.body.name;

        // validate school entity
        const errors: ValidationError[] = await validate(schoolToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = errors;
        } else if (await schoolRepository.findOne({ name: schoolToBeSaved.name })) {
            // return BAD REQUEST status code and name already exists error
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'The specified name already exists';
        } else {
            // save the school contained in the POST body
            const school = await schoolRepository.save(schoolToBeSaved);
            // return CREATED status code and updated school
            ctx.status = httpStatus.CREATED;
            ctx.state.data = school;
            await next();
        }
    }

    @request('put', '/schools/{schoolId}')
    @summary('Update a school')
    @path({
        schoolId: { type: 'number', required: true, description: 'id of school' }
    })
    @body(schoolSchema)
    public static async updateSchool(ctx: BaseContext, next: () => void) {

        // get a school repository to perform operations with school
        const schoolRepository: Repository<School> = getManager().getRepository(School);

        // update the school by specified id
        // build up entity school to be updated
        const schoolToBeUpdated: School = new School();
        schoolToBeUpdated.id = +ctx.params.schoolId || 0; // will always have a number, this will avoid errors
        schoolToBeUpdated.name = ctx.request.body.name;
        schoolToBeUpdated.displayPhoto = ctx.request.body.displayPhoto;

        // validate school entity
        const errors: ValidationError[] = await validate(schoolToBeUpdated); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = errors;
            await next();
        } else if (!await schoolRepository.findOne(schoolToBeUpdated.id)) {
            // check if a school with the specified id exists
            // return a BAD REQUEST status code and error message
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'The school you are trying to update doesn\'t exist in the db';
            await next();
        } else if (await schoolRepository.findOne({ id: Not(Equal(schoolToBeUpdated.id)), name: schoolToBeUpdated.name })) {
            // return BAD REQUEST status code and email already exists error
            ctx.status = httpStatus.BAD_REQUEST;
            ctx.state.message = 'The specified e-mail address already exists';
            await next();
        } else {
            // save the school contained in the PUT body
            const school = await schoolRepository.save(schoolToBeUpdated);
            // return CREATED status code and updated school
            ctx.status = httpStatus.CREATED;
            ctx.state.data = school;
            await next();
        }

    }

    @request('delete', '/schools/{schoolId}')
    @summary('Delete school by id')
    @path({
        id: { type: 'number', required: true, description: 'School ID' }
    })
    public static async deleteSchool(ctx: BaseContext, next: () => void) {

        // get a school repository to perform operations with school
        const schoolRepository = getManager().getRepository(School);

        // find the user by specified id
        const schoolToRemove: School = await schoolRepository.findOne(+ctx.params.schoolId || 0);
        if (!schoolToRemove) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.state.message = 'The user you are trying to delete doesn\'t exist in the db';
        } else if (ctx.state.user.name !== schoolToRemove.name) {
            // check user's token id and user id are the same
            // if not, return a FORBIDDEN status code and error message
            ctx.status = 403;
            ctx.state.message = 'A user can only be deleted by himself';
            await next();
        } else {
            // the user is there so can be removed
            await schoolRepository.remove(schoolToRemove);
            // return a NO CONTENT status code
            ctx.status = httpStatus.NO_CONTENT;
            await next();
        }
    }
}

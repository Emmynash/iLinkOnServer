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
  orderAll,
  securityAll,
} from 'koa-swagger-decorator';
import { User, userSchema } from '../entity/User';
import httpStatus = require('http-status');
import { authHandler } from '@middleware';

@orderAll(3)
@responsesAll({
  200: { description: 'success' },
  400: { description: 'bad request' },
  401: { description: 'unauthorized, missing/wrong jwt token' },
})
@tagsAll(['User'])
@middlewaresAll([authHandler()])
@securityAll([{ AuthorizationToken: [] }])
export default class UserController {
  @request('get', '/users')
  @summary('Find all users')
  public static async getUsers(ctx: BaseContext, next: () => void) {
    // get a user repository to perform operations with user
    const userRepository: Repository<User> = getManager().getRepository(User);

    // load all users
    const users: User[] = await userRepository.find();

    // return OK status code and loaded users array
    ctx.status = httpStatus.OK;
    ctx.state.data = users;
    await next();
  }

  @request('get', '/users/{userId}')
  @summary('Find user by id')
  @path({
    userId: { type: 'number', required: true, description: 'User ID' },
  })
  public static async getUser(ctx: BaseContext, next: () => void) {
    // get a user repository to perform operations with user
    const userRepository: Repository<User> = getManager().getRepository(User);

    // load user by id
    const user: User = await userRepository.findOne(+ctx.params.userId || 0, {
      relations: ['school'],
    });

    if (user) {
      // return OK status code and loaded user object
      ctx.status = httpStatus.OK;
      ctx.state.data = user;
    } else {
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.NOT_FOUND;
      ctx.state.message =
        "The user you are trying to retrieve doesn't exist in the db";
    }
    await next();
  }

  @request('put', '/users/{userId}')
  @summary('Update a user')
  @path({
    userId: { type: 'number', required: true, description: 'User ID' },
  })
  @body(userSchema)
  public static async updateUser(ctx: BaseContext, next: () => void) {
    // get a user repository to perform operations with user
    const userRepository: Repository<User> = getManager().getRepository(User);

    // load user by id
    const user: User = await userRepository.findOne(+ctx.params.userId || 0);

    // update the user by specified id
    // build up entity user to be updated
    const userToBeUpdated: User = new User();
    userToBeUpdated.id = +ctx.params.userId || 0; // will always have a number, this will avoid errors
    userToBeUpdated.profilePhoto = ctx.request.body.profilePhoto;
    userToBeUpdated.fName = ctx.request.body.fName;
    userToBeUpdated.mName = ctx.request.body.mName;
    userToBeUpdated.lName = ctx.request.body.lName;
    userToBeUpdated.email = ctx.request.body.email;
    userToBeUpdated.phone = user.phone;
    userToBeUpdated.interests = ctx.request.body.interests || [];
    userToBeUpdated.school = ctx.request.body.school;

    // validate user entity
    const errors: ValidationError[] = await validate(userToBeUpdated); // errors is an array of validation errors

    console.log(errors);
    if (errors.length > 0) {
      // return BAD REQUEST status code and errors array
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message = errors;
    } else if (!(await userRepository.findOne(userToBeUpdated.id))) {
      // check if a user with the specified id exists
      // return a BAD REQUEST status code and error message
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message =
        "The user you are trying to update doesn't exist in the db";
    } else {
      // save the user contained in the PUT body
      const user = await userRepository.save(userToBeUpdated);
      // return CREATED status code and updated user
      ctx.status = httpStatus.CREATED;
      ctx.state.data = user;
    }
    await next();
  }

  @request('delete', '/users/{userId}')
  @summary('Delete user by id')
  @path({
    userId: { type: 'number', required: true, description: 'User ID' },
  })
  public static async deleteUser(ctx: BaseContext, next: () => void) {
    // get a user repository to perform operations with user
    const userRepository = getManager().getRepository(User);

    // find the user by specified id
    const userToRemove: User = await userRepository.findOne(
      +ctx.params.userId || 0
    );
    if (!userToRemove) {
      // return a BAD REQUEST status code and error message
      ctx.status = 400;
      ctx.state.message =
        "The user you are trying to delete doesn't exist in the db";
    } else if (ctx.state.user.email !== userToRemove.email) {
      // check user's token id and user id are the same
      // if not, return a FORBIDDEN status code and error message
      ctx.status = 403;
      ctx.state.message = 'A user can only be deleted by himself';
    } else {
      // the user is there so can be removed
      await userRepository.remove(userToRemove);
      // return a NO CONTENT status code
      ctx.status = httpStatus.NO_CONTENT;
    }
    await next();
  }
}

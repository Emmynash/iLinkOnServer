import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, body, responsesAll, tagsAll, responses } from 'koa-swagger-decorator';
import HttpStatus from 'http-status';
import { sign } from 'jsonwebtoken';
import { User, userSchema, otpSchema, OneTimePassword } from '@entities';
import { generateOTP, sendSMS } from '@shared';
import { config } from '@config';

@responsesAll({ 200: { description: 'success'}, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
@tagsAll(['Auth'])
export default class AuthController {

    @request('post', '/auth/generate-otp')
    @summary('Generate OTP for signup or login')
    @body({
        phone: { type: 'string', required: true, example: '+2348181484568', description: 'Phone number requesting OTP' },
    })
    public static async generateOTP(ctx: BaseContext, next: () => void) {

        // get a OTP repository to perform operations with user
        const otpRepository: Repository<OneTimePassword> = getManager().getRepository(OneTimePassword);

        let oneTimePassword: OneTimePassword = await otpRepository.findOne({ phone: ctx.request.body.phone });
        if (!oneTimePassword) {
            // build up entity OTP to be saved
            oneTimePassword = new OneTimePassword();
            oneTimePassword.phone = ctx.request.body.phone;
        }
        oneTimePassword.otp = generateOTP();

        // validate OTP entity
        const errors: ValidationError[] = await validate(oneTimePassword); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = errors;
        } else {
            // send sms
            await sendSMS(ctx.request.body.phone, `${oneTimePassword.otp}`);
            // save the OTP contained in the POST body
            const otp = await otpRepository.save(oneTimePassword);
            // return CREATED status code and updated OTP
            ctx.status = HttpStatus.OK;
            ctx.state.data = otp;
        }
        await next();
    }

    @request('post', '/auth/verify-otp')
    @summary('Verify OTP for signup or login')
    @body(otpSchema)
    public static async verifyOTP(ctx: BaseContext, next: () => void) {

        // get a OTP repository to perform operations with user
        const otpRepository: Repository<OneTimePassword> = getManager().getRepository(OneTimePassword);

        const oneTimePassword: OneTimePassword = await otpRepository.findOne(ctx.request.body);
        if (!oneTimePassword) {
            // return BAD REQUEST status code as OTP was not found
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = 'Invalid OTP';
        } else {
            const response = {};
            const userRepository: Repository<User> = getManager().getRepository(User);
            // get user associated with request
            const user: User = await userRepository.findOne({ phone: oneTimePassword.phone });
            if (user) {
                response['user'] = user;
                response['token'] = sign({ ...user }, config.jwtSecret, { expiresIn: '24000h' });
            } else {
                response['new_user'] = true;
                response['token'] = sign({ phone: ctx.request.body.phone }, config.jwtSecret, { expiresIn: '1h' });
            }
            // delete the OTP contained in the POST body
            await otpRepository.delete(oneTimePassword);
            // return OK status code and updated OTP
            ctx.status = HttpStatus.OK;
            ctx.state.data = response;
        }
        await next();
    }

    @request('post', '/auth/register')
    @summary('Register new user')
    @body(userSchema)
    @responses({ 200: {
        description: 'User registration successful',
        example: {
            'application/json': {
                'meta': {
                    'status': 200,
                    'message': 'The specified e-mail address already exists'
                },
                'data': {
                    'fName': 'Kator',
                    'mName': 'Bryan',
                    'lName': 'James',
                    'phone': '+2348181484568',
                    'email': 'kator95@gmail.com',
                    'id': 1,
                    'createdAt': '2020-02-16T18:34:01.255Z',
                    'updatedAt': '2020-02-16T18:34:01.255Z',
                }
              }
        }
    }})
    public static async createUser(ctx: BaseContext, next: () => void) {
        // get a user repository to perform operations with user
        const userRepository: Repository<User> = getManager().getRepository(User);

        // build up entity user to be saved
        const userToBeSaved: User = new User();
        userToBeSaved.fName = ctx.request.body.fName;
        userToBeSaved.mName = ctx.request.body.mName;
        userToBeSaved.lName = ctx.request.body.lName;
        userToBeSaved.phone = ctx.state.temp.phone;
        userToBeSaved.email = ctx.request.body.email;

        // validate user entity
        const errors: ValidationError[] = await validate(userToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = errors;
        } else if (await userRepository.findOne({ email: userToBeSaved.email })) {
            // return BAD REQUEST status code and email already exists error
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = 'The specified e-mail address already exists';
        } else {
            // save the user contained in the POST body
            const user = await userRepository.save(userToBeSaved);
            // return CREATED status code and updated user
            ctx.status = 201;
            ctx.state.data = user;
        }
        await next();
    }
}

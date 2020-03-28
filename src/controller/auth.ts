import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, body, tagsAll, responses, middlewares } from 'koa-swagger-decorator';
import HttpStatus from 'http-status';
import { sign } from 'jsonwebtoken';
import { User, userSchema, otpSchema, OneTimePassword } from '@entities';
import { generateNumericCode, sendSMS, SampleResponses } from '@shared';
import { config } from '@config';
import { authHandler } from '@middleware';

@tagsAll(['Auth'])
export default class AuthController {

    @request('post', '/auth/generate-otp')
    @summary('Generate OTP for signup or login')
    @body({
        phone: { type: 'string', required: true, example: '+2348181484568', description: 'Phone number requesting OTP' },
    })
    @responses(SampleResponses.GenerateOTP)
    public static async generateOTP(ctx: BaseContext, next: () => void) {

        // get a OTP repository to perform operations with user
        const otpRepository: Repository<OneTimePassword> = getManager().getRepository(OneTimePassword);

        let oneTimePassword: OneTimePassword = await otpRepository.findOne({ phone: ctx.request.body.phone });
        if (!oneTimePassword) {
            // build up entity OTP to be saved
            oneTimePassword = new OneTimePassword();
            oneTimePassword.phone = ctx.request.body.phone;
        }
        oneTimePassword.otp = generateNumericCode(config.OTPLength);

        // validate OTP entity
        const errors: ValidationError[] = await validate(oneTimePassword); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = errors;
            await next();
        } else {
            // send sms
            await sendSMS(ctx.request.body.phone, `${oneTimePassword.otp}`);
            // save the OTP contained in the POST body
            const { otp, ...createdOtp} = await otpRepository.save(oneTimePassword);
            // return CREATED status code and updated OTP
            ctx.status = HttpStatus.CREATED;
            ctx.state.data = createdOtp;
            await next();
        }
    }

    @request('post', '/auth/verify-otp')
    @summary('Verify OTP for signup or login')
    @body(otpSchema)
    @responses(SampleResponses.VerifyOTP)
    public static async verifyOTP(ctx: BaseContext, next: () => void) {

        // get a OTP repository to perform operations with user
        const otpRepository: Repository<OneTimePassword> = getManager().getRepository(OneTimePassword);

        const oneTimePassword: OneTimePassword = await otpRepository.findOne(ctx.request.body);
        if (!oneTimePassword) {
            // return BAD REQUEST status code as OTP was not found
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = 'Invalid OTP';
            await next();
        } else {
            const response = {};
            const userRepository: Repository<User> = getManager().getRepository(User);
            // get user associated with request
            const user: User = await userRepository.findOne({ phone: oneTimePassword.phone });
            if (user) {
                response['user'] = user;
                response['token'] = sign({ user }, config.jwtSecret, { expiresIn: '24000h' });
            } else {
                response['new_user'] = true;
                response['token'] = sign({ phone: ctx.request.body.phone }, config.jwtSecret, { expiresIn: '1h' });
            }
            // delete the OTP contained in the POST body
            await otpRepository.delete(oneTimePassword);
            // return OK status code and updated OTP
            ctx.status = HttpStatus.OK;
            ctx.state.data = response;
            await next();
        }
    }

    @request('post', '/auth/register')
    @summary('Register new user')
    @body(userSchema)
    @responses(SampleResponses.CreateUser)
    @middlewares([authHandler(true)])
    public static async createUser(ctx: BaseContext, next: () => void) {
        // get a user repository to perform operations with user
        const userRepository: Repository<User> = getManager().getRepository(User);

        // build up entity user to be saved
        const userToBeSaved: User = new User();
        userToBeSaved.profilePhoto = ctx.request.body.profilePhoto;
        userToBeSaved.fName = ctx.request.body.fName;
        userToBeSaved.mName = ctx.request.body.mName;
        userToBeSaved.lName = ctx.request.body.lName;
        userToBeSaved.phone = ctx.state.temp.phone;
        userToBeSaved.email = ctx.request.body.email;
        userToBeSaved.interests = ctx.request.body.interests || [];
        userToBeSaved.school = ctx.request.body.school;

        // validate user entity
        const errors: ValidationError[] = await validate(userToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = HttpStatus.BAD_REQUEST;
            ctx.state.message = errors;
            await next();
        } else {
            const existingUser = await userRepository.findOne({ phone: userToBeSaved.phone });
            if (existingUser) {
                // return BAD REQUEST status code and email already exists error
                ctx.status = HttpStatus.BAD_REQUEST;
                ctx.state.message = 'The specified phone number already exists';
                await next();
            } else {
                // save the user contained in the POST body
                const user = await userRepository.save(userToBeSaved);
                // return CREATED status code and updated user
                ctx.status = HttpStatus.CREATED;
                ctx.state.data = {
                    user,
                    token: sign({ user }, config.jwtSecret, { expiresIn: '250000h' }),
                };
                await next();
            }
        }
    }
}

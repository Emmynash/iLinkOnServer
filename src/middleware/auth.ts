import { BaseContext } from 'koa';
import HttpStatus from 'http-status';
import { verify } from 'jsonwebtoken';
import unless from 'koa-unless';
import { User } from '@entities';
import { config } from '../config';

export const auth = (isTemp = false) => {
    const authMiddleware = async (ctx: BaseContext, next: () => void) => {
        const token: string | null = ctx.header.authorization || ctx.request.headers.token || ctx.request.query.token;
        if (!token) {
            ctx.status = HttpStatus.UNAUTHORIZED;
            ctx.state.message = 'Invalid token';
            throw 'Invalid token';
        }

        try {
            if (isTemp) ctx.state.temp = verify(token, config.jwtSecret) as User;
            else ctx.state.user = verify(token, config.jwtSecret) as User;
        } catch (err) {
            ctx.status = HttpStatus.UNAUTHORIZED;
            ctx.state.message = 'Invalid token: ' + err;
            throw 'Invalid token' + err;
        }

        await next();
    };

    authMiddleware.unless = unless;
    return authMiddleware;
};

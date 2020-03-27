import { BaseContext } from 'koa';
import HttpStatus from 'http-status';
import { verify } from 'jsonwebtoken';
import unless from 'koa-unless';
import { User } from '@entities';
import { config } from '@config';

export const authHandler = (isTemp = false) => {
    const authMiddleware = async (ctx: BaseContext, next: () => void) => {
        const token: string | null = ctx.header.authorization || ctx.request.headers.token || ctx.request.query.token;
        if (!token) {
            ctx.status = HttpStatus.UNAUTHORIZED;
            ctx.state.message = 'Invalid token';
            throw 'Invalid token';
        }

        try {
            const payload = verify(token, config.jwtSecret);
            if (isTemp) ctx.state.temp = payload;
            else ctx.state.user = payload.user;
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

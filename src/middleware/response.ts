import { BaseContext } from 'koa';
import compose from 'koa-compose';
import { IResponse } from '../interface';

const handler = async (ctx: BaseContext, next: () => void) => {
    const STATUS = ctx.status;
    ctx.body = {} as IResponse;
    ctx.body = {
        meta: {
            status: STATUS,
            message: ctx.state.message || 'success',
        },
        data: ctx.state.data || {}
    };
    if (ctx.state.pagination) {
        ctx.body.meta.limit = ctx.state.pagination.limit;
        ctx.body.meta.offset = ctx.state.pagination.offset;
        ctx.body.meta.totalCount = ctx.state.pagination.totalCount;
    }
    ctx.status = STATUS;
    await next();
};

export const responseHandler = () => compose([
    handler,
]);

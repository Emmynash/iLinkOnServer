import { BaseContext } from 'koa';
import { description, request, summary, tagsAll, orderAll } from 'koa-swagger-decorator';
import httpStatus from 'http-status';

@orderAll(1)
@tagsAll(['General'])
export default class GeneralController {

    @request('get', '/health-check')
    @summary('API Availability status check')
    @description('A health check endpoint to verify the service is up and running.')
    public static async healthCheck(ctx: BaseContext, next: () => void) {
        ctx.status = httpStatus.OK;
        ctx.state.data = '';
        await next();
    }
}

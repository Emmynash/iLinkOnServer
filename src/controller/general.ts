import { BaseContext } from 'koa';
import { description, request, summary, tagsAll } from 'koa-swagger-decorator';
import httpStatus from 'http-status';

@tagsAll(['General'])
export default class GeneralController {

    @request('get', '/health-check')
    @summary('API Availability status check')
    @description('A health check endpoint to verify the service is up and running.')
    public static async healthCheck(ctx: BaseContext) {
        ctx.status = httpStatus.OK;
        ctx.body = '';
    }

}
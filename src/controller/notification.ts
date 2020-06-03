import { BaseContext } from 'koa';
import httpStatus from 'http-status';
import {
  request,
  summary,
  tagsAll,
  orderAll,
  security,
  middlewaresAll,
  body,
} from 'koa-swagger-decorator';

import { NotificationService } from '@services';
import { authHandler } from '@middleware';

@orderAll(9)
@tagsAll(['Notifications'])
@middlewaresAll([authHandler()])
export default class NotificationController {
  @request('post', '/notifications')
  @summary('Register user for notifications')
  @security([{ AuthorizationToken: [] }])
  @body({
    token: { type: 'string', required: true, example: '' },
  })
  public static async RegisterDevice(ctx: BaseContext, next: () => void) {
    try {
      const { token } = ctx.request.body as { token: string };
      const notificationService = new NotificationService(ctx.state.user);
      const result = await notificationService.registerToken(token);

      //   console.log(result);

      ctx.status = httpStatus.CREATED;
      ctx.state.data = result;
    } catch (error) {
      ctx.status = httpStatus.BAD_REQUEST;
      ctx.state.message = `error occured ${error}, or Push token is not a valid Expo push token`;
    }
    await next();
  }
}

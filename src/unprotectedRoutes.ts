import Router from 'koa-router';
import controller = require('./controller');

const unprotectedRouter = new Router();

unprotectedRouter.post('/auth/generate-otp', controller.auth.generateOTP);
unprotectedRouter.post('/auth/verify-otp', controller.auth.verifyOTP);

// Hello World route
unprotectedRouter.get('/', controller.general.helloWorld);

export { unprotectedRouter };

import Router from 'koa-router';
import controller = require('./controller');

const unprotectedRouter = new Router();

unprotectedRouter.post('/auth/generate-otp', controller.auth.generateOTP);
unprotectedRouter.post('/auth/verify-otp', controller.auth.verifyOTP);

// Interests
unprotectedRouter.get('/interests', controller.interest.getInterests);

// Hello World route
unprotectedRouter.get('/health-check', controller.general.healthCheck);

export { unprotectedRouter };

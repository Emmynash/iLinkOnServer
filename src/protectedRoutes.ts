import { SwaggerRouter } from 'koa-swagger-decorator';
import controller = require('./controller');
import { auth } from './middleware/auth';

const protectedRouter = new SwaggerRouter();

// Auth routes
protectedRouter.post('/auth/register', auth(true), controller.auth.createUser);

// USER ROUTES
protectedRouter.get('/users', auth(), controller.user.getUsers);
protectedRouter.get('/users/:id', auth(), controller.user.getUser);
protectedRouter.post('/users', auth(), controller.user.createUser);
protectedRouter.put('/users/:id', auth(), controller.user.updateUser);
protectedRouter.delete('/users/:id', auth(), controller.user.deleteUser);
protectedRouter.delete('/testusers', auth(), controller.user.deleteTestUsers);

// Swagger endpoint
protectedRouter.swagger({
    title: 'ilinkon-server',
    description: 'iLinkOn API REST server using NodeJS and KOA framework, typescript. TypeORM for SQL with class-validators. Middlewares JWT, CORS, Winston Logger.',
    version: '1.5.0',
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
protectedRouter.mapDir(__dirname);

export { protectedRouter };

import { SwaggerRouter } from 'koa-swagger-decorator';
import controller = require('./controller');
import { auth } from './middleware/auth';

const protectedRouter = new SwaggerRouter();

// Auth routes
protectedRouter.post('/auth/register', auth(true), controller.auth.createUser);

// USER ROUTES
protectedRouter.get('/users', auth(), controller.user.getUsers);
protectedRouter.get('/users/:id', auth(), controller.user.getUser);
protectedRouter.put('/users/:id', auth(), controller.user.updateUser);
protectedRouter.delete('/users/:id', auth(), controller.user.deleteUser);

// Group routes
protectedRouter.get('/groups', auth(), controller.group.getGroups);
protectedRouter.get('/groups/:id', auth(), controller.group.getGroup);
protectedRouter.post('/groups', auth(), controller.group.createGroup);
protectedRouter.put('/groups/:id', auth(), controller.group.updateGroup);
protectedRouter.delete('/groups/:id', auth(), controller.group.deleteGroup);
protectedRouter.post('/groups/:id/join', auth(), controller.group.joinGroup);
protectedRouter.post('/groups/:id/remove', auth(), controller.group.exitGroup);
protectedRouter.get('/groups/:groupId/events', auth(), controller.group.getEvents);
protectedRouter.post('/groups/:groupId/events', auth(), controller.group.createEvent);

// School routes
protectedRouter.get('/schools', auth(), controller.school.getSchools);
protectedRouter.get('/schools/:id', auth(), controller.school.getSchool);
protectedRouter.post('/schools', auth(), controller.school.createSchool);
protectedRouter.put('/schools/:id', auth(), controller.school.updateSchool);
protectedRouter.delete('/schools/:id', auth(), controller.school.deleteSchool);

// Interest routes
protectedRouter.post('/interests', auth(), controller.interest.createInterest);
protectedRouter.delete('/interests/:id', auth(), controller.interest.deleteInterest);

// Swagger endpoint
protectedRouter.swagger({
    title: 'ilinkon-server',
    description: 'iLinkOn API REST server using NodeJS and KOA framework, typescript. TypeORM for SQL with class-validators. Middlewares JWT, CORS, Winston Logger.',
    version: '1.5.0',
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
protectedRouter.mapDir(__dirname);

export { protectedRouter };

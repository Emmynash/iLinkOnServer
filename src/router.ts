import { SwaggerRouter } from 'koa-swagger-decorator';

const router = new SwaggerRouter();

// protectedRouter.post('/auth/generate-otp', async (ctx, next) => {console.log('MARKER 1'); await next(); });
// protectedRouter.post('/auth/verify-otp', controller.auth.verifyOTP);

// // Interests
// protectedRouter.get('/interests', controller.interest.getInterests);

// // Hello World route
// protectedRouter.get('/health-check', controller.general.healthCheck);

// // Auth routes
// protectedRouter.post('/auth/register', auth(true), controller.auth.createUser);

// // USER ROUTES
// protectedRouter.get('/users', auth(), controller.user.getUsers);
// protectedRouter.get('/users/:id', auth(), controller.user.getUser);
// protectedRouter.put('/users/:id', auth(), controller.user.updateUser);
// protectedRouter.delete('/users/:id', auth(), controller.user.deleteUser);

// // Group routes
// protectedRouter.get('/groups', auth(), controller.group.getGroups);
// protectedRouter.get('/groups/:groupId', auth(), controller.group.getGroup);
// protectedRouter.post('/groups', auth(), controller.group.createGroup);
// protectedRouter.put('/groups/:groupId', auth(), controller.group.updateGroup);
// protectedRouter.delete('/groups/:groupId', auth(), controller.group.deleteGroup);
// protectedRouter.post('/groups/:groupId/members', auth(), controller.group.getMembers);
// protectedRouter.post('/groups/:groupId/join', auth(), controller.group.joinGroup);
// protectedRouter.post('/groups/:groupId/leave', auth(), controller.group.exitGroup);
// protectedRouter.get('/groups/:groupId/events', auth(), controller.group.getEvents);
// protectedRouter.post('/groups/:groupId/events', auth(), controller.group.createEvent);

// // Events
// protectedRouter.get('/events', auth(), controller.event.getEvents);
// protectedRouter.post('/events/:eventId/rsvp', auth(), controller.event.rsvpEvent);
// protectedRouter.get('/events/:eventId/rsvp', auth(), controller.event.getRsvps);

// // School routes
// protectedRouter.get('/schools', auth(), controller.school.getSchools);
// protectedRouter.get('/schools/:schoolId', auth(), controller.school.getSchool);
// protectedRouter.post('/schools', auth(), controller.school.createSchool);
// protectedRouter.put('/schools/:schoolId', auth(), controller.school.updateSchool);
// protectedRouter.delete('/schools/:schoolId', auth(), controller.school.deleteSchool);

// // Interest routes
// protectedRouter.post('/interests', auth(), controller.interest.createInterest);
// protectedRouter.delete('/interests/:interestId', auth(), controller.interest.deleteInterest);

// Swagger endpoint
router.swagger({
    title: 'ilinkon-server',
    description: 'iLinkOn API REST server using NodeJS and KOA framework, typescript. TypeORM for SQL with class-validators. Middlewares JWT, CORS, Winston Logger.',
    version: '1.0.0',
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
router.mapDir(__dirname);

export { router };

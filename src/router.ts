import { SwaggerRouter } from 'koa-swagger-decorator';

const router = new SwaggerRouter();

// Swagger endpoint
router.swagger({
    title: 'ilinkon-server',
    description: 'iLinkOn API REST server using NodeJS and KOA framework, typescript. TypeORM for SQL with class-validators. Middlewares JWT, CORS, Winston Logger.',
    version: '1.0.0',
    swaggerOptions: {
        securityDefinitions: {
            AuthorizationToken: {
              type: 'apiKey',
              in: 'header',
              name: 'Authorization',
            },
            TempAuthorizationToken: {
              type: 'apiKey',
              in: 'header',
              name: 'TempAuthorization',
            },
        },
    },
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
router.mapDir(__dirname);

export { router };

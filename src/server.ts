import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import cors from '@koa/cors';
import winston from 'winston';
import { createConnection } from 'typeorm';
import http, { request } from 'http';
import WebSocket from 'ws';
import 'reflect-metadata';
import * as PostgressConnectionStringParser from 'pg-connection-string';

import { errorHandler, responseHandler, wsAuthHandler } from '@middleware';
import { logger } from './logging';
import { config } from './config';
import { router } from './router';
import { cron } from './cron';
import { IWsRequest } from './interface';
import { handleConnection } from './socket/handlers/connection';

// Get DB connection options from env variable
const connectionOptions = PostgressConnectionStringParser.parse(
  config.databaseUrl
);

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
createConnection({
  type: 'postgres',
  host: connectionOptions.host,
  port: +connectionOptions.port,
  username: connectionOptions.user,
  password: connectionOptions.password,
  database: connectionOptions.database,
  synchronize: process.env.DB_LOGGING === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: config.dbEntitiesPath,
  extra: {
    ssl: config.dbsslconn, // if not development, will use SSL
  },
})
  .then(async (connection) => {
    const app = new Koa();

    // Provides important security headers to make your app more secure
    app.use(helmet());

    // Enable cors with default options
    app.use(cors());

    // Logger middleware -> use winston as logger (logging.ts with config)
    app.use(logger(winston));

    // Enable bodyParser with default options
    app.use(bodyParser());

    // Handle error on any throws
    app.use(errorHandler());

    // these routes are NOT protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
    app.use(router.routes()).use(router.allowedMethods());

    // JWT middleware -> below this line routes are only reached if JWT token is valid, secret as env variable
    // do not protect swagger-json and swagger-html endpoints
    // app.use(auth().unless({ path: [/^\/swagger-/] }));

    // These routes are protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
    // app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());

    // Enable response middleware
    app.use(responseHandler());

    // Register cron job to do any action needed
    cron.start();

    const server = http.createServer(app.callback());
    const webSocket = new WebSocket.Server({
      noServer: true,
      clientTracking: false,
    });

    webSocket.on('connection', handleConnection);

    server.on('upgrade', (request: IWsRequest, socket, head) => {
      // This function is not defined on purpose. Implement it with your own logic.
      wsAuthHandler(request, (err) => {
        if (err || !request.user) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        webSocket.handleUpgrade(request, socket, head, function done(ws) {
          webSocket.emit('connection', ws, request);
        });
      });
    });

    server.listen(config.port);

    console.log(`Server running on port ${config.port}`);
  })
  .catch((err) => console.log('TypeORM connection error: ', err));

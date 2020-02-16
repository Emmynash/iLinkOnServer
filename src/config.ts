import dotenv from 'dotenv';
import { DatabaseType } from 'typeorm';

dotenv.config({ path: '.env' });

export interface IConfig {
    port: number;
    debugLogging: boolean;
    dbsslconn: boolean;
    jwtSecret: string;
    databaseUrl: string;
    dbEntitiesPath: string[];
    cronJobExpression: string;
    twilioAccountSid: string;
    twilioToken: string;
    twilioSender: string;
    OTPLength: number;
}

const isDevMode = process.env.NODE_ENV == 'development';

const config: IConfig = {
    port: +process.env.PORT || 3000,
    debugLogging: isDevMode,
    dbsslconn: !isDevMode,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-whatever',
    databaseUrl: process.env.DATABASE_URL || 'postgres://kator:@localhost:5432/ilinkon',
    dbEntitiesPath: [
      ... isDevMode ? ['src/entity/**/*.ts'] : ['dist/entity/**/*.js'],
    ],
    cronJobExpression: '0 * * * *',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioSender: process.env.TWILIO_FROM || '',
    OTPLength: +(process.env.OTP_LENGTH || 4),
};

export { config };

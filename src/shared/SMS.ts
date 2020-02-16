import * as twilio from 'twilio';
import { config } from '@config';

const client = new twilio.Twilio(config.twilioAccountSid, config.twilioToken);

export const sendSMS = async (to: string, body: string): Promise<string> => {
    try {
        if (!to) {
            throw new Error('Specify valid message recipient');
        }

        const message = await client.messages.create({
            from: config.twilioSender,
            to,
            body,
        });

        return message.sid;
    } catch (err) {
        throw err;
    }
};

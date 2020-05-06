import Pusher from 'pusher';
import { config } from '@config';


export const pusher = new Pusher(config.pusher);

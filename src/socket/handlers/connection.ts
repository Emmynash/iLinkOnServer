import http, { request } from 'http';
import WebSocket from 'ws';
import { getManager } from 'typeorm';

import { IWsRequest } from '@interfaces';
import { MessageThread, Message } from '@entities';
import { NotificationService } from '@services';

const map = new Map();

export const handleConnection = (ws: WebSocket.Server, request: IWsRequest) => {
    const userId = request.user.id;

    map.set(userId, ws);

    ws.on('message', async (msg: string) => {
        const { threadId, text } = JSON.parse(msg) as { threadId?: number; text: string };
        if (threadId && text) {
            const messageRepository = getManager().getRepository(Message);
            const messageThreadRepository = getManager().getRepository(MessageThread);
            const messageThread = await messageThreadRepository.findOne(+threadId || 0);
            if (MessageThread) {
                const message = new Message();
                message.sender = request.user;
                message.thread = messageThread;
                message.text = text;

                await messageRepository.save(message);
                messageThread.updatedAt = new Date();
                await messageThreadRepository.save(messageThread);

                const notificationService = new NotificationService();
                const notification = {
                    title: 'New Message',
                    body: text,
                };
                const participant = messageThread.participants.find((p) => p.id !== userId);
                await notificationService.sendTo(notification, participant, messageThread.group);
            }
        }
        console.log(`Received message ${msg} from user ${userId}`);
    });
    ws.on('close', () => {
        // Delete user from map
        map.delete(userId);
    });
};

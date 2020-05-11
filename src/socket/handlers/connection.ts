import WebSocket from 'ws';
import { getManager } from 'typeorm';

import { IWsRequest } from '@interfaces';
import { MessageThread, Message } from '@entities';
import { NotificationService } from '@services';

const map = new Map<number, WebSocket>();

export const handleConnection = (ws: WebSocket, request: IWsRequest) => {
    const userId = request.user.id;

    map.set(userId, ws);

    ws.on('message', async (msg: string) => {
        const { threadId, text } = JSON.parse(msg) as { threadId: number; text: string };
        console.log(`Received message ${threadId}:${text} from user ${userId}`);
        if (threadId && text) {
            const messageRepository = getManager().getRepository(Message);
            const messageThreadRepository = getManager().getRepository(MessageThread);
            const messageThread = await messageThreadRepository.findOne(+threadId || 0);
            if (messageThread) {
                const message = new Message();
                message.sender = request.user;
                message.thread = messageThread;
                message.text = text;

                await messageRepository.save(message);
                messageThread.updatedAt = new Date();
                await messageThreadRepository.save(messageThread);
                const participant = messageThread.participants.find((p) => p.id !== userId);

                const receiverWs = map.get(participant.id);
                if (receiverWs) {
                    const payload = {
                        thread: messageThread,
                        message,
                    };
                    receiverWs.send(JSON.stringify(payload));
                } else {
                    const notificationService = new NotificationService();
                    const notification = {
                        title: `${request.user.fName} ${request.user.lName}`,
                        body: text,
                    };
                    const receiver = await participant.participant;
                    await notificationService.sendTo(notification, receiver, messageThread.group);
                }
            }
        }
    });
    ws.on('close', () => {
        // Delete user from map
        map.delete(userId);
    });
};

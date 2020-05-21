import WebSocket from 'ws';
import { getManager } from 'typeorm';

import { IWsRequest } from '@interfaces';
import { MessageThread, Message } from '@entities';
import { NotificationService, GroupService } from '@services';

const map = new Map<number, WebSocket>();

export const handleConnection = (ws: WebSocket, request: IWsRequest) => {
  const userId = request.user.id;

  map.set(userId, ws);

  ws.on('message', async (msg: string) => {
    const { threadId, text } = JSON.parse(msg) as {
      threadId: number;
      text: string;
    };
    console.log(`Received message ${threadId}:${text} from user ${userId}`);
    if (threadId && text) {
      const messageRepository = getManager().getRepository(Message);
      const messageThreadRepository = getManager().getRepository(MessageThread);
      const messageThread = await messageThreadRepository.findOne(
        +threadId || 0
      );
      const notification = {
        title: `${request.user.fName} ${request.user.lName}`,
        body: text,
      };
      if (messageThread) {
        const message = new Message();
        message.sender = request.user;
        message.thread = messageThread;
        message.text = text;

        // Save message to db
        await messageRepository.save(message);
        messageThread.updatedAt = new Date();
        await messageThreadRepository.save(messageThread);

        if (messageThread.groupId) {
          // Group Message
          const groupService = new GroupService();
          const group = await groupService.getGroup(messageThread.groupId);
          const notificationService = new NotificationService();
          await notificationService.sendToGroup(notification, group);
        } else {
          // PM
          const participant = messageThread.participants.find(
            (p) => p.participantId !== userId
          );

          const receiverWs = map.get(participant.participantId);

          if (receiverWs) {
            const payload = {
              thread: messageThread,
              message,
            };
            receiverWs.send(JSON.stringify(payload));
          } else {
            const notificationService = new NotificationService();
            const receiver = await participant.participant;
            await notificationService.sendToUser(notification, receiver);
          }
        }
      }
    }
  });
  ws.on('close', () => {
    // Delete user from map
    map.delete(userId);
  });
};

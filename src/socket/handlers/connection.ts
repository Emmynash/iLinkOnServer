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
    try {
      const {
        threadId,
        text,
        audio,
        image,
        file,
        fileName,
        messageType,
      } = JSON.parse(msg) as {
        threadId: number;
        text: string;
        audio: string;
        image: string;
        file: string;
        fileName: string;
        messageType: any;
      };
      console.log(
        `Received message ${threadId}:${
          text || file || audio || image
        } from user ${userId}`
      );
      if ((threadId && text) || image || file || audio) {
        const messageRepository = getManager().getRepository(Message);
        const messageThreadRepository = getManager().getRepository(
          MessageThread
        );
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
          message.audio = audio;
          message.file = file;
          message.fileName = fileName;
          message.image = image;
          message.messageType = messageType;

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
            const participant = messageThread.participants.find((p) => {
              const result = p.participantId !== userId;
              return result;
            });

            const receiverWs = map.get(participant.participantId);

            if (receiverWs) {
              const payload = {
                thread: messageThread,
                message,
              };

              const sender = payload.message.sender;
              const text = payload.message.text;
              const audio = payload.message.audio;
              const image = payload.message.image;
              const file = payload.message.file;
              const messageType = payload.message.messageType;

              console.log(sender, text, audio, image, file, messageType);
              receiverWs.send(JSON.stringify(payload));
            } else {
              try {
                const notificationService = new NotificationService();
                const receiver = await participant.participant;

                await notificationService.sendToUser(notification, receiver);
              } catch (error) {
                console.log('err', error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('Error occured', error);
    }
  });
  ws.on('close', () => {
    // Delete user from map
    map.delete(userId);
  });
};

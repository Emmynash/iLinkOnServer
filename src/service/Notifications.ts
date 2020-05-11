import { getConnection, DeleteResult, Repository, In } from 'typeorm';
import { validate } from 'class-validator';
import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushToken, ExpoPushReceipt } from 'expo-server-sdk';

import { NotificationToken, User, Group, GroupMember } from '@entities';
import { CONSTANTS } from '@shared';
import { INotificationTicket, IExpoPushResult } from '@interfaces';

type IShippingError = {
    user: User | undefined;
    reason: string;
};

type ISendResponse = {
    tokensNotRegistered: NotificationToken[];
    shippingErrors: IShippingError[];
};

export class NotificationService {
    private user: User;
    private expo: Expo;
    private repository: Repository<NotificationToken>;

    constructor(user?: User) {
        this.user = user;
        this.expo = new Expo();
        this.repository = getConnection().getRepository(NotificationToken);
    }

    public async registerToken(token: string) {
        const existingToken = await this.repository.find({
            token,
        });
        if (existingToken) {
            throw new Error('The token is already registered');
        }
        const notification = new NotificationToken();
        notification.token = token;
        notification.user = this.user;

        const errors = await validate(notification);
        if (errors.length > 0) {
            throw errors;
        }
        const result = await this.repository.save(notification);
        return result;
    }

    public async broadcast({ title, body }): Promise<ISendResponse | undefined> {
        const validTokens = await this.getTokens();
        const result = await this.sendAndCleanUp({ title, body }, validTokens);
        return result;
    }

    public async sendTo({ title, body }, user?: User, group?: Group): Promise<ISendResponse | undefined> {
        const tokens = [];
        if (user) {
            const validTokens = await this.getUserTokens(user);
            tokens.push(validTokens);
        }

        if (group) {
            const validTokens = await this.getGroupTokens(group.members);
            tokens.push(validTokens);
        }
        const result = await this.sendAndCleanUp({ title, body }, tokens);
        return result;
    }

    public async sendAndCleanUp({ title, body }, tokens: NotificationToken[]): Promise<ISendResponse | undefined> {
        const notifications = this.buildNotifications(tokens, body, title);
        const tickets = await this.sendNotifications(notifications);
        const resultsFromExpo = this.getPushResultsFromExpo(tickets);
        const resultsFromProvider = await this.getPushResultsFromProviders(resultsFromExpo.validTickets);
        const errorsFromProvider = this.getErrorsFromProviders(resultsFromProvider);
        const ticketsNotRegistered = [...resultsFromExpo.ticketsNotRegistered, ...errorsFromProvider.ticketsNotRegistered];
        const ticketsWithErrors = [...resultsFromExpo.ticketsWithErrors, ...errorsFromProvider.ticketsWithErrors];
        let shippingErrors: IShippingError[] = [];
        let tokensNotRegistered: NotificationToken[] = [];

        if (ticketsWithErrors.length) {
            const promised = ticketsWithErrors.map(async ({ message, token }) => {
                const notificationToken = await this.repository.findOne({
                    where: { token },
                    relations: ['user'],
                });

                return {
                    reason: message,
                    user: notificationToken.user,
                };
            });
            shippingErrors = await Promise.all(promised);
        }

        if (ticketsNotRegistered.length) {
            tokensNotRegistered = tokens.filter((notificationToken) => ticketsNotRegistered.includes(notificationToken.token));
            await this.removeTokensNotRegistered(ticketsNotRegistered, tokens);
        }

        return {
            tokensNotRegistered,
            shippingErrors,
        };
    }

    public async getTokens(): Promise<NotificationToken[]> {
        const recordedTokens = await this.repository.find();
        const validTokens = recordedTokens.reduce((collection: NotificationToken[], recordedToken) => {
            if (Expo.isExpoPushToken(recordedToken.token)) {
                collection.push(recordedToken);
            }
            return collection;
        }, []);

        return validTokens;
    }

    public async getUserTokens(user: User): Promise<NotificationToken[]> {
        const recordedTokens = await this.repository.find({
            user,
        });
        const validTokens = recordedTokens.reduce((collection: NotificationToken[], recordedToken) => {
            if (Expo.isExpoPushToken(recordedToken.token)) {
                collection.push(recordedToken);
            }
            return collection;
        }, []);

        return validTokens;
    }

    public async getGroupTokens(groupMembers: GroupMember[]): Promise<NotificationToken[]> {
        const groupMemberIds = groupMembers.map(gm => gm.memberId);
        const recordedTokens = await this.repository.find({
            where: {
                userId: In(groupMemberIds)
            },
        });
        const validTokens = recordedTokens.reduce((collection: NotificationToken[], recordedToken) => {
            if (Expo.isExpoPushToken(recordedToken.token)) {
                collection.push(recordedToken);
            }
            return collection;
        }, []);

        return validTokens;
    }

    public buildNotifications(notificationTokens: NotificationToken[], body: string, title: string): ExpoPushMessage[] {
        const notifications = notificationTokens.map((notificationToken) => {
            const token: ExpoPushToken = notificationToken.token;
            return ({
                channelId: CONSTANTS.VALUES.NOTIFICATIONS_CHANNEL,
                to: token,
                title,
                body,
            });
        });

        return notifications;
    }

    public getErrorsFromProviders(allReceipts: ExpoPushReceipt[]): IExpoPushResult {
        const ticketsNotRegistered = [];
        const ticketsWithErrors = [];
        const receipts = (allReceipts as unknown) as INotificationTicket[];
        const receiptsWithError = receipts.filter(
            receipt => receipt.status === CONSTANTS.ERROR_MESSAGES.PUSH_NOTIFICATION_ERROR,
        );

        for (let i = 0; i < receiptsWithError.length; i++) {
            const { token, details, message } = receiptsWithError[i];

            if (details.error === CONSTANTS.ERROR_MESSAGES.DEVICE_NOT_REGISTERED) {
                ticketsNotRegistered.push(token);
            } else {
                ticketsWithErrors.push({
                    message,
                    token,
                });
            }
        }

        return {
            ticketsNotRegistered,
            ticketsWithErrors,
        };
    }

    private getErrorMessage(error: string): string {
        switch (error) {
            case CONSTANTS.ERROR_MESSAGES.NOTIFICATION_PAYLOAD_TOO_LARGE:
                return 'Notification data size exceeded allowed limit (4096 bytes).';

            case CONSTANTS.ERROR_MESSAGES.NOTIFICATION_RATE_EXCEEDED:
                return 'Too many notifications have been sent to this device in a short time. Try again later.';

            case CONSTANTS.ERROR_MESSAGES.INVALID_NOTIFICATION_CREDENTIALS:
                return 'Invalid notification push credentials.';

            default:
                return 'Unknown error.';
        }
    }

    public getPushResultsFromExpo(allTickets: ExpoPushTicket[]): IExpoPushResult & { validTickets: INotificationTicket[] } {
        const ticketsNotRegistered = [];
        const ticketsWithErrors = [];
        const validTickets = [];
        const tickets = (allTickets as unknown) as INotificationTicket[];

        for (let i = 0; i < tickets.length; i++) {
            const { status, token, details } = tickets[i];
            const hasError = status === CONSTANTS.ERROR_MESSAGES.PUSH_NOTIFICATION_ERROR;

            if (!hasError) {
                validTickets.push(tickets[i]);
                continue;
            }

            const isDeviceNotRegistered = details && details.error === CONSTANTS.ERROR_MESSAGES.DEVICE_NOT_REGISTERED;

            if (isDeviceNotRegistered) {
                ticketsNotRegistered.push(token);
                continue;
            }

            const message = details && details.error ? this.getErrorMessage(details.error) : 'Unknown error.';

            ticketsWithErrors.push({
                message,
                token,
            });
        }

        return {
            ticketsNotRegistered,
            ticketsWithErrors,
            validTickets,
        };
    }

    public async getPushResultsFromProviders(tickets: INotificationTicket[]): Promise<ExpoPushReceipt[]> {
        const receiptsIds = tickets.map(ticket => ticket.id);
        const receiptChunks = this.expo.chunkPushNotificationReceiptIds(receiptsIds);
        const ticketsWithError = [];
        for (const receiptChunk of receiptChunks) {
            const receipts = await this.expo.getPushNotificationReceiptsAsync(receiptChunk);
            const receiptsArray = Object.keys(receipts).map(receipt => ({
                ...receipts[receipt],
                receipt,
            }));

            const receiptsWithError = receiptsArray.filter(
                ({ status }) => status === CONSTANTS.ERROR_MESSAGES.PUSH_NOTIFICATION_ERROR,
            );

            ticketsWithError.push(...receiptsWithError);
        }

        return ticketsWithError;
    }

    public async removeTokensNotRegistered(
        tokensNotRegistered: string[],
        allTokens: NotificationToken[],
    ): Promise<(DeleteResult | null)[]> {
        const tokensToRemove = allTokens.filter(notificationToken => tokensNotRegistered.includes(notificationToken.token));

        return Promise.all(tokensToRemove.map(async ({ id }) => this.repository.delete(id)));
    }

    public async sendNotifications(notifications: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
        const chunks = this.expo.chunkPushNotifications(notifications);
        const tickets = [];

        for (const chunk of chunks) {
            try {
                const results = await this.expo.sendPushNotificationsAsync(chunk);
                tickets.push(
                    ...results.map((result, index) => ({
                        ...result,
                        token: chunk[index].to,
                    })),
                );
            } catch (error) {
                throw error;
            }
        }

        return tickets;
    }
}

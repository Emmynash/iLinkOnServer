import { User } from '@entities';
import { IncomingMessage } from 'http';

export interface IResponse {
    meta: IMetaData;
    data?: any;
}

export interface IMetaData {
    status: number;
    message: string;
    limit?: number;
    offset?: number;
    totalCount?: number;
    stack?: string;
    error?: string;
}

export interface IPagination {
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: string;
    totalCount?: number;
}

export interface ITokenData {
    user?: User;
    phone?: string;
}

export interface IWsRequest extends IncomingMessage {
    user?: User;
}

export interface INotificationTicket {
    message: string;
    status: string;
    token: string;
    id: string;
    details?: {
        error?: 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded' | 'DeviceNotRegistered' | undefined;
    };
}

export type IPushResultError = {
    message: string;
    token: string;
};

export type IExpoPushResult = {
    ticketsWithErrors: IPushResultError[];
    ticketsNotRegistered: string[];
};

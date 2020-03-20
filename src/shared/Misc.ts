import { config } from '@config';
import { ValidationError } from 'class-validator';

export interface IErrorItem {
    [key: string]: any;
}

export interface IResponse<T> {
    success: boolean;
    data?: T;
    errors?: IErrorItem[];
    error?: IErrorItem;
}

export const generateNumericCode = (length: number = config.OTPLength): string => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 1; i <= length; i++) {
        const index = Math.floor(Math.random() * (digits.length));
        otp = otp + digits[index];
    }

    return otp;
};

export const computeResponse = <T>(isSuccess: boolean, data: T) => {
    const response: IResponse<T> = {
        success: true,
    };

    if (!isSuccess) {
        response['success'] = false;
    }

    if (!isSuccess && data && Array.isArray(data) && data[0].property && data[0].target) {
        // is ValidationError instances
        response['errors'] = data.map((err: ValidationError): IErrorItem => {
            const errorItem: IErrorItem = {};
            errorItem[err.property] = err.constraints;
            return errorItem;
        });
    } else if (!isSuccess && !Array.isArray(data)) {
        response['error'] = data as any;
    } else if (!isSuccess) {
        response['errors'] = data as any;
    } else {
        response['data'] = data;
    }

    return response;
};

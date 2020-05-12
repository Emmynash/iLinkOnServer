import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import Expo from 'expo-server-sdk';

@ValidatorConstraint({ name: 'isValidPosition', async: false })
export class ExpoTokenValidator implements ValidatorConstraintInterface {

    validate(token: string, args: ValidationArguments) {
        return Expo.isExpoPushToken(token); // for async validations you must return a Promise<boolean> here
    }

    defaultMessage({ value }: ValidationArguments) {
        return `${value} is not a valid token`;
    }
}

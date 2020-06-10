import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Expo } from 'expo-server-sdk';

@ValidatorConstraint({ name: 'isValidPosition', async: false })
export class ExpoTokenValidator implements ValidatorConstraintInterface {
  validate(token: string, args: ValidationArguments) {
    console.log(token);
    return Expo.isExpoPushToken(token); // for async validations you must return a Promise<boolean> here
    // return token.length > 8 && token.length < 30;
  }

  defaultMessage({ value }: ValidationArguments) {
    return `${value} is not a valid token`;
  }
}

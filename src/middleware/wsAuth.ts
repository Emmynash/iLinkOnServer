import { verify } from 'jsonwebtoken';
import queryString from 'query-string';
import url from 'url';

import { config } from '@config';
import { User } from '@entities';
import { ITokenData } from '@interfaces';
import { IWsRequest } from 'src/interface';

export const wsAuthHandler = async (request: IWsRequest, callbackFn: (err?: Error, user?: User) => void) => {
  try {
    const urlObject = url.parse(request.url);
    const { token } = queryString.parse(urlObject.query) as { token: string };

    if (!token) {
      callbackFn(new Error('Invalid token'));
    }
    const payload = verify(token, config.jwtSecret) as ITokenData;
    request.user = payload.user;
    callbackFn(undefined);
  } catch (err) {
    callbackFn(err);
  }
};

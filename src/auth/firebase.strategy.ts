/* eslint-disable @typescript-eslint/no-var-requires */
//const serviceAccount = require('serviceAccountKey.json');
/* eslint-enable @typescript-eslint/no-var-requires */

import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
//import * as firebase from 'firebase-admin';
import firebaseAdminApp from 'firebase.initialization';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase-auth',
) {
  //private defaultApp: any;
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
    /*
    this.defaultApp = firebase.initializeApp({
      credential: firebase.credential.cert('serviceAccountKey.json'),
    });*/
  }
  async validate(token: string) {
    const firebaseUser: any = await firebaseAdminApp
      .auth()
      .verifyIdToken(token, true)
      .catch((err) => {
        console.log(err);
        throw new UnauthorizedException(err.message);
      });
    if (!firebaseUser) {
      throw new UnauthorizedException();
    }
    return firebaseUser;
  }
}

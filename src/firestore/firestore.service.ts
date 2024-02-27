import { Injectable } from '@nestjs/common';
//import firebaseAdminApp from 'firebase.initialization';

@Injectable()
export class FirestoreService {
  async getData() {
    //const firestore = firebaseAdminApp.firestore();
    return 'get firestore';
  }
}

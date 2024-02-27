// firebase.initialization.ts

import * as firebase from 'firebase-admin';

const firebaseAdminApp = firebase.initializeApp({
  credential: firebase.credential.cert('serviceAccountKey.json'),
});

export default firebaseAdminApp;

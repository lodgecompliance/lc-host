import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/messaging'
import config from './config';

firebase.initializeApp(config.firebase.sdk)
export const auth = firebase.auth();
export const storage = firebase.storage();
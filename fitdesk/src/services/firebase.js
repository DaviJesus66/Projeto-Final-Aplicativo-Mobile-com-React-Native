import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// As chaves vêm do arquivo .env (veja .env.example). No Expo, só variáveis
// com prefixo EXPO_PUBLIC_ chegam ao app, e precisam ser lidas desta forma estática.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Evita inicializar duas vezes (Fast Refresh recarrega os módulos).
const jaInicializado = getApps().length > 0;
const app = jaInicializado ? getApp() : initializeApp(firebaseConfig);

// No celular, a sessão é guardada no AsyncStorage para o usuário continuar o mesmo
// depois de fechar o app. Na web o Firebase já cuida disso sozinho.
export const auth =
  jaInicializado || Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);

// Login anônimo: cada aparelho ganha um uid próprio e seus dados ficam em
// users/{uid}/..., sem precisar de tela de cadastro. Devolve o uid (a promessa é compartilhada).
let promessaUsuario = null;

export function garantirUsuario() {
  if (!promessaUsuario) {
    promessaUsuario = new Promise((resolve, reject) => {
      const cancelar = onAuthStateChanged(auth, (user) => {
        if (user) {
          cancelar();
          resolve(user.uid);
        } else {
          signInAnonymously(auth).catch((error) => {
            cancelar();
            promessaUsuario = null; // permite tentar de novo depois
            reject(error);
          });
        }
      });
    });
  }
  return promessaUsuario;
}

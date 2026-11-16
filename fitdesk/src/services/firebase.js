import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
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

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Firebase sem configuração: copie .env.example para .env, preencha as chaves e reinicie com "npx expo start -c".'
  );
}

// Evita inicializar duas vezes (Fast Refresh recarrega os módulos).
const jaInicializado = getApps().length > 0;
const app = jaInicializado ? getApp() : initializeApp(firebaseConfig);

// No celular, a sessão é guardada no AsyncStorage para a pessoa continuar logada
// depois de fechar o app. Na web o Firebase já cuida disso sozinho.
export const auth =
  jaInicializado || Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);

// uid de quem está logada agora. Os dados de cada pessoa ficam em users/{uid}/...
export function uidAtual() {
  const user = auth.currentUser;
  if (!user) throw new Error('Nenhum usuário autenticado.');
  return user.uid;
}

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';

// Autenticação real com Firebase Authentication (e-mail e senha).
// A sessão é mantida pelo próprio Firebase (AsyncStorage no celular), e o uid
// da conta é a pasta onde ficam os dados da pessoa no Firestore: users/{uid}/...
const AuthContext = createContext(null);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function publicUser(fbUser, name) {
  const email = fbUser.email || '';
  return {
    id: fbUser.uid,
    name: name || fbUser.displayName || email.split('@')[0] || 'Usuário',
    email,
  };
}

// Traduz o código de erro do Firebase para uma mensagem em português.
function mensagemDeErro(error, acao) {
  switch (error && error.code) {
    case 'auth/email-already-in-use':
      return 'Já existe uma conta com esse e-mail.';
    case 'auth/invalid-email':
      return 'Digite um e-mail válido.';
    case 'auth/weak-password':
      return 'A senha é fraca. Use pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet. Verifique a rede e tente de novo.';
    case 'auth/operation-not-allowed':
      return 'O login por e-mail e senha não está ativado no Firebase (Authentication > Sign-in method).';
    default:
      return acao === 'cadastro'
        ? 'Não foi possível criar a conta. Tente novamente.'
        : 'Não foi possível entrar. Tente novamente.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Acompanha a sessão: recupera quem já estava logada ao abrir o app e reage a login/logout.
  useEffect(() => {
    const cancelar = onAuthStateChanged(
      auth,
      (fbUser) => {
        setUser(fbUser ? publicUser(fbUser) : null);
        setIsLoaded(true);
      },
      (error) => {
        console.warn('Falha ao ler a sessão:', error);
        setUser(null);
        setIsLoaded(true);
      }
    );
    return cancelar;
  }, []);

  // Cria a conta e já deixa a pessoa logada. Retorna { ok: true } ou { ok: false, error }.
  const register = useCallback(async ({ name, email, password }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
      const cleanName = String(name || '').trim();
      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (error) {
        console.warn('Conta criada, mas não foi possível salvar o nome:', error);
      }
      const session = publicUser(cred.user, cleanName);
      setUser(session);
      return { ok: true, user: session };
    } catch (error) {
      console.warn('Falha ao criar a conta:', error);
      return { ok: false, error: mensagemDeErro(error, 'cadastro') };
    }
  }, []);

  // Entra com e-mail e senha. Retorna { ok: true } ou { ok: false, error }.
  const login = useCallback(async ({ email, password }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
      return { ok: true, user: publicUser(cred.user) };
    } catch (error) {
      console.warn('Falha ao entrar:', error);
      return { ok: false, error: mensagemDeErro(error, 'login') };
    }
  }, []);

  // Sai da conta. Os dados continuam salvos no Firestore para o próximo login.
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Falha ao sair:', error);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoggedIn: !!user, isLoaded, register, login, logout }),
    [user, isLoaded, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }
  return ctx;
}

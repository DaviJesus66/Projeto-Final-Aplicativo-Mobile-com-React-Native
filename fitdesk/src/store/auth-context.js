import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ATENÇÃO: este login é uma SIMULAÇÃO local.
// As contas ficam salvas só neste aparelho (AsyncStorage), sem servidor.
// Em um app real, use o Firebase Authentication e nunca guarde senha em texto puro.
const USERS_KEY = '@auth_users';
const SESSION_KEY = '@auth_session';

const AuthContext = createContext(null);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

async function readUsers() {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn('Falha ao ler as contas salvas:', error);
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ao abrir o app, recupera a sessão salva (se a pessoa já estava logada).
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const saved = await AsyncStorage.getItem(SESSION_KEY);
        if (saved && active) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) setUser(parsed);
        }
      } catch (error) {
        console.warn('Falha ao ler a sessão salva:', error);
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  // Cria a conta e já deixa a pessoa logada. Retorna { ok: true } ou { ok: false, error }.
  const register = useCallback(async ({ name, email, password }) => {
    try {
      await wait(600);
      const users = await readUsers();
      const cleanEmail = normalizeEmail(email);
      if (users.some((u) => u.email === cleanEmail)) {
        return { ok: false, error: 'Já existe uma conta com esse e-mail.' };
      }
      const newUser = { id: makeId(), name: String(name).trim(), email: cleanEmail, password };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      const session = publicUser(newUser);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { ok: true, user: session };
    } catch (error) {
      console.warn('Falha ao criar a conta:', error);
      return { ok: false, error: 'Não foi possível criar a conta. Tente novamente.' };
    }
  }, []);

  // Entra com e-mail e senha. Retorna { ok: true } ou { ok: false, error }.
  const login = useCallback(async ({ email, password }) => {
    try {
      await wait(600);
      const users = await readUsers();
      const cleanEmail = normalizeEmail(email);
      const found = users.find((u) => u.email === cleanEmail && u.password === password);
      if (!found) {
        return { ok: false, error: 'E-mail ou senha incorretos.' };
      }
      const session = publicUser(found);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { ok: true, user: session };
    } catch (error) {
      console.warn('Falha ao entrar:', error);
      return { ok: false, error: 'Não foi possível entrar. Tente novamente.' };
    }
  }, []);

  // Sai da conta (as contas cadastradas continuam salvas no aparelho).
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn('Falha ao sair:', error);
    }
    setUser(null);
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
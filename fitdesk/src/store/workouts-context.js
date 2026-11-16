import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { newId } from '../utils/date';
import { atualizarDoc, excluirDoc, excluirVarios, observarColecao, salvarDoc } from '../services/repositorio';
import { useAuth } from './auth-context';
import { useFeedback } from './feedback-context';

const COLECAO = 'workouts';

// Modelo de cada treino registrado: { id, exercise, group, muscle, sets, reps, date }
// O reducer sempre devolve um novo array (sem push, splice ou mutação direta).
export function workoutsReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...state];
    case 'UPDATE':
      return state.map((w) =>
        w.id === action.payload.id ? { ...w, ...action.payload.data } : w
      );
    case 'DELETE':
      return state.filter((w) => w.id !== action.payload);
    case 'SET':
      return action.payload;
    default:
      return state;
  }
}

const WorkoutsContext = createContext(null);

export function WorkoutsContextProvider({ children }) {
  const { user } = useAuth();
  const { showError } = useFeedback();
  const uid = user ? user.id : null;

  const [workouts, dispatch] = useReducer(workoutsReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fonte da verdade: o Firestore (users/{uid}/workouts). Cada mudança na coleção
  // (inclusive as feitas por este próprio app) chega aqui e vira um SET no reducer.
  // Ao trocar de conta a escuta é refeita; sem login não há nada para carregar.
  useEffect(() => {
    if (!uid) {
      dispatch({ type: 'SET', payload: [] });
      setIsLoaded(true);
      return undefined;
    }
    setIsLoaded(false);
    const cancelar = observarColecao(
      COLECAO,
      (lista) => {
        dispatch({ type: 'SET', payload: lista });
        setIsLoaded(true);
      },
      (error) => {
        console.warn('Falha ao ler os treinos do Firestore:', error);
        showError('Não foi possível carregar os treinos. Verifique a conexão e as regras do Firestore.');
        setIsLoaded(true);
      }
    );
    return cancelar;
  }, [uid, showError]);

  // Sem await nas telas: com o Firestore offline a promise só resolve ao reconectar.
  const addWorkout = useCallback(
    (data) => {
      salvarDoc(COLECAO, newId(), data).catch((error) => {
        console.warn('Falha ao salvar o treino:', error);
        showError('Não foi possível salvar o treino.');
      });
    },
    [showError]
  );
  const updateWorkout = useCallback(
    (id, data) => {
      atualizarDoc(COLECAO, id, data).catch((error) => {
        console.warn('Falha ao atualizar o treino:', error);
        showError('Não foi possível atualizar o treino.');
      });
    },
    [showError]
  );
  const deleteWorkout = useCallback(
    (id) => {
      excluirDoc(COLECAO, id).catch((error) => {
        console.warn('Falha ao excluir o treino:', error);
        showError('Não foi possível excluir o treino.');
      });
    },
    [showError]
  );
  const clearWorkouts = useCallback(() => {
    excluirVarios(COLECAO, workouts.map((w) => w.id)).catch((error) => {
      console.warn('Falha ao limpar os treinos:', error);
      showError('Não foi possível limpar os treinos.');
    });
  }, [workouts, showError]);

  // Sempre do mais recente para o mais antigo.
  const sorted = useMemo(
    () => [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [workouts]
  );

  const value = useMemo(
    () => ({ workouts: sorted, isLoaded, addWorkout, updateWorkout, deleteWorkout, clearWorkouts }),
    [sorted, isLoaded, addWorkout, updateWorkout, deleteWorkout, clearWorkouts]
  );

  return <WorkoutsContext.Provider value={value}>{children}</WorkoutsContext.Provider>;
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) {
    throw new Error('useWorkouts deve ser usado dentro de um WorkoutsContextProvider.');
  }
  return ctx;
}

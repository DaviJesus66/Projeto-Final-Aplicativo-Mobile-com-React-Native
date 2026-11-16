import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { newId } from '../utils/date';
import { excluirDoc, observarColecao, salvarDoc } from '../services/repositorio';
import { useAuth } from './auth-context';
import { useFeedback } from './feedback-context';

const COLECAO = 'measures';

// Cada medição: { id, weight (kg), height (cm), date }
export function measuresReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...state];
    case 'DELETE':
      return state.filter((m) => m.id !== action.payload);
    case 'SET':
      return action.payload;
    default:
      return state;
  }
}

const MeasuresContext = createContext(null);

export function MeasuresContextProvider({ children }) {
  const { user } = useAuth();
  const { showError } = useFeedback();
  const uid = user ? user.id : null;

  const [measures, dispatch] = useReducer(measuresReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Firestore (users/{uid}/measures) como fonte da verdade; refaz a escuta ao trocar de conta.
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
        console.warn('Falha ao ler as medidas do Firestore:', error);
        showError('Não foi possível carregar as medidas. Verifique a conexão e as regras do Firestore.');
        setIsLoaded(true);
      }
    );
    return cancelar;
  }, [uid, showError]);

  const addMeasure = useCallback(
    (data) => {
      salvarDoc(COLECAO, newId(), { date: new Date().toISOString(), ...data }).catch((error) => {
        console.warn('Falha ao salvar a medida:', error);
        showError('Não foi possível salvar a medida.');
      });
    },
    [showError]
  );
  const deleteMeasure = useCallback(
    (id) => {
      excluirDoc(COLECAO, id).catch((error) => {
        console.warn('Falha ao excluir a medida:', error);
        showError('Não foi possível excluir a medida.');
      });
    },
    [showError]
  );

  const sorted = useMemo(
    () => [...measures].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [measures]
  );

  const value = useMemo(
    () => ({ measures: sorted, isLoaded, addMeasure, deleteMeasure }),
    [sorted, isLoaded, addMeasure, deleteMeasure]
  );

  return <MeasuresContext.Provider value={value}>{children}</MeasuresContext.Provider>;
}

export function useMeasures() {
  const ctx = useContext(MeasuresContext);
  if (!ctx) {
    throw new Error('useMeasures deve ser usado dentro de um MeasuresContextProvider.');
  }
  return ctx;
}

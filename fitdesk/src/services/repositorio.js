import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, uidAtual } from './firebase';

// Camada de acesso ao Firestore. Os dados de cada usuário ficam em
// users/{uid}/{nome}/{id}  (ex.: users/abc123/workouts/1699999-x7k2).
// Todas as funções usam o uid de quem está logada (Firebase Authentication).

// O Firestore recusa campos `undefined`; aqui eles são removidos antes de gravar.
function limpar(data) {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

// Escuta a coleção em tempo real. Devolve uma função para cancelar a escuta.
// O snapshot também dispara para gravações locais (mesmo offline), então a tela atualiza na hora.
export function observarColecao(nome, aoReceber, aoFalhar) {
  let uid;
  try {
    uid = uidAtual();
  } catch (error) {
    aoFalhar(error);
    return () => {};
  }
  return onSnapshot(
    collection(db, 'users', uid, nome),
    (snapshot) => aoReceber(snapshot.docs.map((d) => ({ ...d.data(), id: d.id }))),
    aoFalhar
  );
}

export async function salvarDoc(nome, id, data) {
  const uid = uidAtual();
  const { id: _ignorado, ...resto } = data;
  await setDoc(doc(db, 'users', uid, nome, id), limpar(resto));
}

export async function atualizarDoc(nome, id, data) {
  const uid = uidAtual();
  const { id: _ignorado, ...resto } = data;
  await updateDoc(doc(db, 'users', uid, nome, id), limpar(resto));
}

export async function excluirDoc(nome, id) {
  const uid = uidAtual();
  await deleteDoc(doc(db, 'users', uid, nome, id));
}

// Exclui vários documentos (um lote do Firestore aceita no máximo 500 operações).
export async function excluirVarios(nome, ids) {
  const uid = uidAtual();
  for (let i = 0; i < ids.length; i += 500) {
    const lote = writeBatch(db);
    ids.slice(i, i + 500).forEach((id) => lote.delete(doc(db, 'users', uid, nome, id)));
    await lote.commit();
  }
}

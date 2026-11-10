import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'workouts';
const col = collection(db, COLLECTION);

// Escuta a coleção em tempo real: chama onData com a lista toda a cada mudança.
export function subscribeWorkouts(onData, onError) {
  const q = query(col, orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export function createWorkout(data) {
  return addDoc(col, data);
}

export function editWorkout(id, data) {
  return updateDoc(doc(db, COLLECTION, id), data);
}

export function removeWorkout(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}

export async function removeAllWorkouts() {
  const snapshot = await getDocs(col);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'measures';
const col = collection(db, COLLECTION);

export function subscribeMeasures(onData, onError) {
  const q = query(col, orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export function createMeasure(data) {
  return addDoc(col, data);
}

export function removeMeasure(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    writeBatch,
    runTransaction,
} from "firebase/firestore";
import { db } from "../../firebase";

// Firestore helper service
// Contract (high level):
// - collectionPath: string like "users" or "users/{uid}/posts"
// - id: document id when required
// - returns plain JS objects with an `id` property included where applicable
// - throws firestore errors up to callers

function mapDoc(docSnap) {
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() };
}

function mapDocs(querySnapshot) {
    const out = [];
    querySnapshot.forEach((d) => out.push({ id: d.id, ...d.data() }));
    return out;
}

export async function getDocById(collectionPath, id) {
    const ref = doc(db, collectionPath, id);
    const snap = await getDoc(ref);
    return mapDoc(snap);
}

export async function getCollection(collectionPath) {
    const col = collection(db, collectionPath);
    const snaps = await getDocs(col);
    return mapDocs(snaps);
}

export async function queryWhere(collectionPath, field, opStr, value) {
    const col = collection(db, collectionPath);
    const q = query(col, where(field, opStr, value));
    const snaps = await getDocs(q);
    return mapDocs(snaps);
}

export async function addDocument(collectionPath, data) {
    const col = collection(db, collectionPath);
    const ref = await addDoc(col, data);
    return { id: ref.id };
}

// Note: File upload/storage functionality removed. We're no longer using Firebase Storage.

export async function setDocument(collectionPath, id, data, options = { merge: false }) {
    const ref = doc(db, collectionPath, id);
    await setDoc(ref, data, { merge: options.merge });
    return { id };
}

export async function updateDocument(collectionPath, id, data) {
    const ref = doc(db, collectionPath, id);
    await updateDoc(ref, data);
    return { id };
}

export async function deleteDocument(collectionPath, id) {
    const ref = doc(db, collectionPath, id);
    await deleteDoc(ref);
    return { id };
}

// Subscribe to a collection snapshot. callback receives array of docs.
export function onCollectionSnapshot(collectionPath, callback) {
    const col = collection(db, collectionPath);
    const un = onSnapshot(col, (snap) => callback(mapDocs(snap)));
    return un;
}

// Subscribe to a single document snapshot. callback receives doc object or null.
export function onDocSnapshot(collectionPath, id, callback) {
    const ref = doc(db, collectionPath, id);
    const un = onSnapshot(ref, (snap) => callback(mapDoc(snap)));
    return un;
}

// Run a batch of operations. ops is an array like:
// { type: 'set'|'update'|'delete'|'add', collectionPath, id?, data?, options? }
export async function runBatchWrite(ops = []) {
    const batch = writeBatch(db);

    for (const op of ops) {
        const { type, collectionPath, id, data, options } = op;
        if (type === "add") {
            const col = collection(db, collectionPath);
            const ref = doc(col);
            batch.set(ref, data);
        } else if (type === "set") {
            if (!id) throw new Error("set op requires id");
            const ref = doc(db, collectionPath, id);
            batch.set(ref, data, options?.merge ? { merge: true } : {});
        } else if (type === "update") {
            if (!id) throw new Error("update op requires id");
            const ref = doc(db, collectionPath, id);
            batch.update(ref, data);
        } else if (type === "delete") {
            if (!id) throw new Error("delete op requires id");
            const ref = doc(db, collectionPath, id);
            batch.delete(ref);
        } else {
            throw new Error(`Unknown batch op type: ${type}`);
        }
    }

    await batch.commit();
}

// runTransaction wrapper. updater receives transaction and should return a value or promise.
export async function runFirestoreTransaction(updater) {
    return await runTransaction(db, async (transaction) => {
        return await updater(transaction);
    });
}

export default {
    getDocById,
    getCollection,
    queryWhere,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    onCollectionSnapshot,
    onDocSnapshot,
    runBatchWrite,
    runFirestoreTransaction,
};

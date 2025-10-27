import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    linkWithPopup,
    updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

// Simple contract:
// - inputs: email/password or OAuth provider
// - outputs: firebase UserCredential or void
// - errors: throws firebase errors

export async function signupWithEmail(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }
    // ensure a user document exists in Firestore
    try {
        const u = userCredential.user;
        await setDoc(doc(db, "users", u.uid), {
            uid: u.uid,
            email: u.email || null,
            displayName: u.displayName || displayName || null,
            photoURL: u.photoURL || null,
            provider: u.providerId || (u.providerData && u.providerData[0]?.providerId) || "password",
            createdAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        // don't block signup on firestore write errors, but surface in console
        console.error("Failed to create user document:", err);
    }
    return userCredential;
}

export async function loginWithEmail(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
    return await signOut(auth);
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function sendResetEmail(email) {
    return await sendPasswordResetEmail(auth, email);
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export async function signInWithGoogle() {
    const userCredential = await signInWithPopup(auth, googleProvider);
    // ensure user record
    try {
        const u = userCredential.user;
        await setDoc(doc(db, "users", u.uid), {
            uid: u.uid,
            email: u.email || null,
            displayName: u.displayName || null,
            photoURL: u.photoURL || null,
            provider: "google",
            lastLoginAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.error("Failed to upsert Google user document:", err);
    }
    return userCredential;
}

export async function signInWithGitHub() {
    const userCredential = await signInWithPopup(auth, githubProvider);
    try {
        const u = userCredential.user;
        await setDoc(doc(db, "users", u.uid), {
            uid: u.uid,
            email: u.email || null,
            displayName: u.displayName || null,
            photoURL: u.photoURL || null,
            provider: "github",
            lastLoginAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.error("Failed to upsert GitHub user document:", err);
    }
    return userCredential;
}

// Link currently signed-in user with Google account via popup
export async function linkGoogle() {
    if (!auth.currentUser) throw new Error("No authenticated user to link provider to");
    const userCredential = await linkWithPopup(auth.currentUser, googleProvider);
    try {
        const u = userCredential.user;
        // merge provider info into user doc
        await setDoc(doc(db, "users", u.uid), {
            uid: u.uid,
            email: u.email || null,
            displayName: u.displayName || null,
            photoURL: u.photoURL || null,
            provider: (u.providerData && u.providerData[0]?.providerId) || "google",
            lastLinkedAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.error("Failed to upsert linked Google user document:", err);
    }
    return userCredential;
}

// Link currently signed-in user with GitHub account via popup
export async function linkGitHub() {
    if (!auth.currentUser) throw new Error("No authenticated user to link provider to");
    const userCredential = await linkWithPopup(auth.currentUser, githubProvider);
    try {
        const u = userCredential.user;
        await setDoc(doc(db, "users", u.uid), {
            uid: u.uid,
            email: u.email || null,
            displayName: u.displayName || null,
            photoURL: u.photoURL || null,
            provider: (u.providerData && u.providerData[0]?.providerId) || "github",
            lastLinkedAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.error("Failed to upsert linked GitHub user document:", err);
    }
    return userCredential;
}

import { db } from './firebase';
import {
    doc,
    getDoc,
    updateDoc,
    setDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

export interface WalletTransaction {
    id: string;
    userId: string;
    type: 'add' | 'deduct';
    amount: number;
    reason: string;
    paymentId?: string;
    createdAt: Date;
}

export interface WalletPin {
    pinHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export const getWallet = async (userId: string): Promise<number> => {
    const ref = doc(db, 'wallets', userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            balance: 0,
            updatedAt: serverTimestamp(),
        });
        return 0;
    }

    return snap.data().balance || 0;
};

export const addMoney = async (userId: string, amount: number, paymentId?: string): Promise<void> => {
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);

    const currentBalance = walletSnap.exists() ? walletSnap.data().balance : 0;

    await updateDoc(walletRef, {
        balance: currentBalance + amount,
        updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'walletTransactions'), {
        userId,
        type: 'add',
        amount,
        reason: 'wallet_topup',
        paymentId: paymentId || '',
        createdAt: serverTimestamp(),
    });
};

export const deductMoney = async (userId: string, amount: number, reason: string): Promise<void> => {
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);

    const currentBalance = walletSnap.exists() ? walletSnap.data().balance : 0;

    if (currentBalance < amount) {
        throw new Error('Insufficient balance');
    }

    await updateDoc(walletRef, {
        balance: currentBalance - amount,
        updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'walletTransactions'), {
        userId,
        type: 'deduct',
        amount,
        reason,
        createdAt: serverTimestamp(),
    });
};

export const getWalletTransactions = async (userId: string): Promise<WalletTransaction[]> => {
    const q = query(
        collection(db, 'walletTransactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
    })) as WalletTransaction[];
};

export const setWalletPin = async (userId: string, pinHash: string): Promise<void> => {
    const pinRef = doc(db, 'walletPins', userId);
    await setDoc(pinRef, {
        pinHash,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

export const getWalletPin = async (userId: string): Promise<WalletPin | null> => {
    const pinRef = doc(db, 'walletPins', userId);
    const snap = await getDoc(pinRef);

    if (!snap.exists()) return null;

    return {
        pinHash: snap.data().pinHash,
        createdAt: snap.data().createdAt.toDate(),
        updatedAt: snap.data().updatedAt.toDate(),
    };
};

export const updateWalletPin = async (userId: string, newPinHash: string): Promise<void> => {
    const pinRef = doc(db, 'walletPins', userId);
    await updateDoc(pinRef, {
        pinHash: newPinHash,
        updatedAt: serverTimestamp(),
    });
};

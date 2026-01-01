import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { loadRazorpay, openRazorpay } from '@/lib/razorpay';

interface WalletTransaction {
    id: string;
    type: 'add' | 'deduct';
    amount: number;
    reason: string;
    paymentId?: string;
    createdAt: Date;
}

interface WalletContextType {
    balance: number;
    transactions: WalletTransaction[];
    hasPin: boolean;
    addMoney: (amount: number) => Promise<void>;
    deductMoney: (amount: number, reason: string) => Promise<void>;
    createPin: (pin: string) => Promise<void>;
    updatePin: (oldPin: string, newPin: string) => Promise<void>;
    verifyPin: (pin: string) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [hasPin, setHasPin] = useState(false);

    useEffect(() => {
        if (!user) return;
        loadWallet();
        loadTransactions();
        checkPin();
    }, [user]);

    const loadWallet = async () => {
        const ref = doc(db, 'wallets', user!.id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            await setDoc(ref, {
                balance: 0,
                updatedAt: serverTimestamp(),
            });
            setBalance(0);
        } else {
            setBalance(snap.data().balance || 0);
        }
    };
    const loadTransactions = async () => {
        console.log('Loading transactions for user:', user!.id);

        try {
            const q = query(
                collection(db, 'walletTransactions'),
                where('userId', '==', user!.id),
                orderBy('createdAt', 'desc')
            );

            const snap = await getDocs(q);
            console.log('Firestore query result:', snap.size, 'documents found');

            snap.forEach(doc => {
                console.log('Transaction:', doc.id, doc.data());
            });

            const txns = snap.docs.map(d => ({
                id: d.id,
                type: d.data().type,
                amount: d.data().amount,
                reason: d.data().reason,
                paymentId: d.data().paymentId,
                createdAt: d.data().createdAt.toDate(),
            }));

            console.log('Processed transactions:', txns);
            setTransactions(txns);
        } catch (error: any) {
            console.error('FULL ERROR loading transactions:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            setTransactions([]);
        }
    };
    const checkPin = async () => {
        const pinRef = doc(db, 'walletPins', user!.id);
        const snap = await getDoc(pinRef);
        setHasPin(snap.exists());
    };

    const addMoney = async (amount: number) => {
        const loaded = await loadRazorpay();
        if (!loaded) throw new Error('Payment gateway failed to load');

        return new Promise<void>((resolve, reject) => {
            openRazorpay(
                amount,
                {
                    name: user!.name,
                    email: user!.email,
                },
                async () => {
                    try {
                        const ref = doc(db, 'wallets', user!.id);
                        const snap = await getDoc(ref);
                        const currentBalance = snap.exists() ? snap.data().balance : 0;

                        await updateDoc(ref, {
                            balance: currentBalance + amount,
                            updatedAt: serverTimestamp(),
                        });

                        await addDoc(collection(db, 'walletTransactions'), {
                            userId: user!.id,
                            type: 'add',
                            amount,
                            reason: 'Wallet Top-up',
                            createdAt: serverTimestamp(),
                        });

                        setBalance(prev => prev + amount);
                        await loadTransactions();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
                (error: any) => {
                    reject(new Error(error || 'Payment failed'));
                }
            );
        });
    };

    const deductMoney = async (amount: number, reason: string) => {
        if (balance < amount) throw new Error('Insufficient balance');

        const ref = doc(db, 'wallets', user!.id);
        await updateDoc(ref, {
            balance: balance - amount,
            updatedAt: serverTimestamp(),
        });

        await addDoc(collection(db, 'walletTransactions'), {
            userId: user!.id,
            type: 'deduct',
            amount,
            reason,
            createdAt: serverTimestamp(),
        });

        setBalance(prev => prev - amount);
        await loadTransactions();
    };

    const createPin = async (pin: string) => {
        const pinHash = btoa(pin);
        const pinRef = doc(db, 'walletPins', user!.id);
        await setDoc(pinRef, {
            pinHash,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        setHasPin(true);
    };

    const updatePin = async (oldPin: string, newPin: string) => {
        const pinRef = doc(db, 'walletPins', user!.id);
        const snap = await getDoc(pinRef);

        if (!snap.exists()) throw new Error('No PIN found');

        const oldPinHash = btoa(oldPin);
        if (snap.data().pinHash !== oldPinHash) {
            throw new Error('Incorrect old PIN');
        }

        const newPinHash = btoa(newPin);
        await updateDoc(pinRef, {
            pinHash: newPinHash,
            updatedAt: serverTimestamp(),
        });
    };

    const verifyPin = async (pin: string): Promise<boolean> => {
        const pinRef = doc(db, 'walletPins', user!.id);
        const snap = await getDoc(pinRef);

        if (!snap.exists()) return false;

        const pinHash = btoa(pin);
        return snap.data().pinHash === pinHash;
    };

    return (
        <WalletContext.Provider value={{
            balance,
            transactions,
            hasPin,
            addMoney,
            deductMoney,
            createPin,
            updatePin,
            verifyPin
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const ctx = useContext(WalletContext);
    if (!ctx) throw new Error('useWallet must be inside WalletProvider');
    return ctx;
};

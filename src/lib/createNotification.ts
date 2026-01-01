// lib/createNotification.ts
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'order_confirmed' | 'order_preparing' | 'order_ready'
) => {
  await addDoc(collection(db, 'notification'), {
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
};


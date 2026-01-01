import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: 'order_confirmed' | 'order_preparing' | 'order_ready';
};

type NotificationContextType = {
  notifications: Notification[];
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  markAllRead: async () => {},
  markRead: async (_id: string) => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, 'notification'), // make sure collection name matches createNotification()
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(docSnap => {
        const data = docSnap.data();

        let type: Notification['type'] = 'order_confirmed';
        if (data.title === 'Order Ready') type = 'order_ready';
        else if (data.title === 'Order Preparing') type = 'order_preparing';

        return {
          id: docSnap.id,
          title: data.title,
          message: data.message,
          read: data.read ?? false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          type,
        } as Notification;
      });

      setNotifications(list);
    });

    return () => unsub();
  }, [user]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(
      unread.map(n => updateDoc(doc(db, 'notification', n.id), { read: true }))
    );
  };

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notification', id), { read: true });
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

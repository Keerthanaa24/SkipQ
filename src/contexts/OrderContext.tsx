import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { CartItem } from './CartContext';
import { createNotification, NotificationType } from '@/services/notificationService';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'collected';
export type PaymentMethod = 'upi' | 'card' | 'wallet';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  tokenNumber: number;
  counterName: string;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: 'completed';
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (
    items: CartItem[],
    totalAmount: number,
    paymentMethod: PaymentMethod,
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const counters = ['Counter A', 'Counter B', 'Counter C'];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setOrders([]);
      setCurrentOrder(null);
      return;
    }

    // SIMPLE QUERY: Get ALL orders first, filter manually
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, snapshot => {
      // Map ALL documents
      const allOrders: Order[] = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId || '',
          items: d.items || [],
          totalAmount: d.totalAmount || 0,
          status: d.status || 'pending',
          tokenNumber: d.tokenNumber || 0,
          counterName: d.counterName || '',
          createdAt: d.createdAt?.toDate() || new Date(),
          updatedAt: d.updatedAt?.toDate() || new Date(),
          paymentMethod: d.paymentMethod || 'upi',
          paymentStatus: d.paymentStatus || 'completed',
        };
      });

      // Filter for current user ONLY
      const userOrders = allOrders.filter(order => order.userId === user.id);
      setOrders(userOrders);

      // Find latest active order
      const active = userOrders
        .filter(o => o.status !== 'collected')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      setCurrentOrder(active || null);
    });

    return () => unsub();
  }, [user]);

  // ✅ CREATE ORDER → FIRESTORE + NOTIFICATION
  const createOrder = async (
    items: CartItem[],
    totalAmount: number,
    paymentMethod: PaymentMethod
  ): Promise<Order> => {
    if (!user?.id) throw new Error('User not logged in');

    const tokenNumber = Math.floor(100 + Math.random() * 900);
    const counterName = counters[Math.floor(Math.random() * counters.length)];

    const docRef = await addDoc(collection(db, 'orders'), {
      userId: user.id,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        preparationTime: item.preparationTime,
      })),
      totalAmount,
      status: 'confirmed',
      tokenNumber,
      counterName,
      paymentMethod,
      paymentStatus: 'completed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 🔔 Notification after order placement
    await createNotification(
      user.id,
      'Order Confirmed',
      `Your order #${docRef.id} has been successfully placed.`,
      'order_confirmed'
    );

    return {
      id: docRef.id,
      userId: user.id,
      items,
      totalAmount,
      status: 'confirmed',
      tokenNumber,
      counterName,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentMethod,
      paymentStatus: 'completed',
    };
  };

  // ✅ UPDATE ORDER STATUS + NOTIFICATION
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });

    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    const orderData = orderDoc.data();
    if (!orderData?.userId) return; // ✅ Prevent missing userId

    let title = '';
    let message = '';
    let type: NotificationType = 'order_confirmed';

    switch (status) {
      case 'preparing':
        title = 'Order Preparing';
        message = `Your order #${orderId} is being prepared.`;
        type = 'order_preparing';
        break;
      case 'ready':
        title = 'Order Ready';
        message = `Your order #${orderId} is ready for pickup.`;
        type = 'order_ready';
        break;
      case 'collected':
        title = 'Order Collected';
        message = `You have collected your order #${orderId}.`;
        type = 'order_confirmed';
        break;
      default:
        return;
    }

    await createNotification(orderData.userId, title, message, type);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        createOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used inside OrderProvider');
  return context;
};

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 🔹 Notification types
export type NotificationType = 'order_confirmed' | 'order_preparing' | 'order_ready';

/**
 * Create a notification for a user.
 * @param userId User UID
 * @param title Notification title
 * @param message Notification message
 * @param type Notification type (default: 'order_confirmed')
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'order_confirmed'
) {
  try {
    await addDoc(collection(db, 'notification'), {
      userId,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
      type, // ensures correct icon/color in UI
    });
    console.log('Notification created:', title, type);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

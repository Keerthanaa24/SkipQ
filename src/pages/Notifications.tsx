import React from 'react';
import { Bell, Package, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { format } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification as NotificationType } from '@/contexts/NotificationContext';

const getNotificationIcon = (type: NotificationType['type']) => {
  switch (type) {
    case 'order_ready':
      return <CheckCircle className="w-5 h-5 text-status-ready" />;
    case 'order_preparing':
      return <Clock className="w-5 h-5 text-status-preparing" />;
    case 'order_confirmed':
    default:
      return <Package className="w-5 h-5 text-status-pending" />;
  }
};

const Notifications: React.FC = () => {
  const { notifications, markAllRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground text-sm">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification: NotificationType) => (
              <Card
                key={notification.id}
                variant="elevated"
                className={`transition-all ${
                  !notification.read ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notification.type === 'order_ready'
                          ? 'bg-status-ready/20'
                          : notification.type === 'order_preparing'
                          ? 'bg-status-preparing/20'
                          : 'bg-status-pending/20'
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-semibold ${
                            !notification.read ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(notification.createdAt, 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="elevated">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">
                You'll receive notifications about your orders here
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;

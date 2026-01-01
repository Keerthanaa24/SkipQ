import React from 'react';
import { Clock, MapPin, CheckCircle2, Timer, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Order, OrderStatus } from '@/contexts/OrderContext';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    color: 'bg-muted text-muted-foreground',
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-status-pending/20 text-status-pending',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-status-preparing/20 text-status-preparing',
    icon: <Timer className="w-4 h-4" />,
  },
  ready: {
    label: 'Ready',
    color: 'bg-status-ready/20 text-status-ready',
    icon: <Package className="w-4 h-4" />,
  },
  collected: {
    label: 'Collected',
    color: 'bg-status-collected/20 text-status-collected',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const status = statusConfig[order.status];

  return (
    <Card 
      variant="interactive" 
      className="overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-semibold">{order.id}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.icon}
            {status.label}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {order.items.slice(0, 2).map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - 2} more items
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(order.createdAt, 'h:mm a')}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {order.counterName}
            </div>
          </div>
          <p className="font-bold text-primary">₹{order.totalAmount}</p>
        </div>

        {(order.status === 'preparing' || order.status === 'ready') && (
          <div className="mt-3 p-3 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-display font-bold text-primary">
              Token: #{order.tokenNumber}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;

import React from 'react';
import { MapPin, Clock, QrCode } from 'lucide-react';
import { Order, OrderStatus } from '@/contexts/OrderContext';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

interface TokenDisplayProps {
  order: Order;
  showQR?: boolean;
}

const statusConfig: Record<OrderStatus, { label: string; bgClass: string; textClass: string; animate?: boolean }> = {
  pending: {
    label: 'Pending Payment',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
  },
  confirmed: {
    label: 'Order Confirmed',
    bgClass: 'bg-status-pending/20',
    textClass: 'text-status-pending',
  },
  preparing: {
    label: '🍳 Preparing Your Order',
    bgClass: 'bg-status-preparing/20',
    textClass: 'text-status-preparing',
    animate: true,
  },
  ready: {
    label: '✅ Ready for Pickup!',
    bgClass: 'bg-status-ready/20',
    textClass: 'text-status-ready',
    animate: true,
  },
  collected: {
    label: 'Order Collected',
    bgClass: 'bg-status-collected/20',
    textClass: 'text-status-collected',
  },
};

const TokenDisplay: React.FC<TokenDisplayProps> = ({ order, showQR = false }) => {
  const status = statusConfig[order.status];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {/* Status Badge */}
      <div className={`px-6 py-2 rounded-full text-lg font-semibold mb-8 ${status.bgClass} ${status.textClass} ${status.animate ? 'animate-pulse-glow' : ''}`}>
        {status.label}
      </div>

      {/* Token Number */}
      <div className="mb-6">
        <p className="text-muted-foreground mb-2">Your Token Number</p>
        <div className="text-8xl md:text-9xl font-display font-bold gradient-text">
          {order.tokenNumber}
        </div>
      </div>

      {/* Counter Info */}
      <div className="flex items-center gap-2 text-xl mb-8">
        <MapPin className="w-6 h-6 text-primary" />
        <span className="font-semibold">{order.counterName}</span>
      </div>

      {/* Pickup Time */}
      <div className="flex items-center gap-2 text-muted-foreground mb-8">
        <Clock className="w-5 h-5" />
        <span>
          Estimated pickup: {format(order.estimatedPickupTime, 'h:mm a')}
        </span>
      </div>

      {/* QR Code (Fallback) */}
      {showQR && (
        <div className="mt-4 p-4 bg-card rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" />
            QR Fallback
          </p>
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG 
              value={JSON.stringify({
                orderId: order.id,
                token: order.tokenNumber,
                counter: order.counterName,
              })}
              size={150}
            />
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="w-full max-w-sm mt-8 p-4 bg-card rounded-xl border border-border">
        <h4 className="font-semibold mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-border flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDisplay;

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Home, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import QRCode from 'react-qr-code';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Order as OrderType } from '@/contexts/OrderContext';

const EXPIRY_MINUTES = 15;

const Token: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch order from Firestore
  useEffect(() => {
    if (!orderId || !user?.id) return;

    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (!snap.exists()) {
          navigate('/orders');
          return;
        }

        const d = snap.data();
        if (d.userId !== user.id) {
          navigate('/orders');
          return;
        }

        const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
        const expiryTime = createdAt.getTime() + EXPIRY_MINUTES * 60 * 1000;
        const remainingSeconds = Math.max(Math.floor((expiryTime - Date.now()) / 1000), 0);

        setOrder({
          id: snap.id,
          userId: d.userId || '',
          items: d.items || [],
          totalAmount: d.totalAmount || 0,
          status: d.status || 'pending',
          tokenNumber: d.tokenNumber || 0,
          counterName: d.counterName || '',
          createdAt,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
          paymentMethod: d.paymentMethod || 'upi',
          paymentStatus: d.paymentStatus || 'pending',
        });

        setTimeLeft(remainingSeconds);
      } catch (err) {
        console.error(err);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading order...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500">Order not found or does not belong to you</p>
          <Link to="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500 text-xl font-bold">Order Expired</p>
          <p>Please place a new order.</p>
          <Link to="/menu">
            <Button>Order Again</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className="gap-2"
          >
            <QrCode className="w-4 h-4" />
            {showQR ? 'Hide QR' : 'Show QR'}
          </Button>
        </div>

        <Card variant="elevated" className="max-w-2xl mx-auto p-6 flex flex-col items-center gap-4">
          <h2 className="text-4xl font-bold">Token #{order.tokenNumber}</h2>
          <p className="text-lg">Counter: {order.counterName}</p>
          <p className="text-sm text-muted-foreground">Estimated Preparation: 15 min</p>
          <p className="text-xl font-medium">Time Left: {formatTime(timeLeft)}</p>

          {showQR && (
            <div className="mt-4 bg-white p-4 rounded">
              <QRCode value={order.id} size={180} />
            </div>
          )}

          <div className="mt-4 w-full text-left">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <ul className="space-y-1">
              {order.items.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 font-bold text-right">Total: ₹{order.totalAmount}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="gap-2">
                <Home className="w-5 h-5" />
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="gradient" size="lg">
                Order More
              </Button>
            </Link>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Token;

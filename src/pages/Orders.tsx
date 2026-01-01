import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { Clock, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Order as OrderType } from '@/contexts/OrderContext';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: OrderType[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId || '',
          items: d.items || [],
          totalAmount: d.totalAmount || 0,
          status: d.status || 'pending',
          tokenNumber: d.tokenNumber || 0,
          counterName: d.counterName || '',
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
          paymentMethod: d.paymentMethod || 'upi',
          paymentStatus: d.paymentStatus || 'pending',
        };
      });
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading orders...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== 'collected');
  const completedOrders = orders.filter((o) => o.status === 'collected');
  const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-6">Your Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'active' ? 'gradient' : 'outline'}
            onClick={() => setActiveTab('active')}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Active {activeOrders.length > 0 && <span>({activeOrders.length})</span>}
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'gradient' : 'outline'}
            onClick={() => setActiveTab('completed')}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Completed {completedOrders.length > 0 && <span>({completedOrders.length})</span>}
          </Button>
        </div>

        {/* Orders List */}
        {displayedOrders.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {displayedOrders.map((order) => (
              <Card
                key={order.id}
                variant="elevated"
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/token/${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Token #{order.tokenNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item(s) • ₹{order.totalAmount}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        order.status === 'collected' ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="text-center p-8">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {activeTab === 'active'
                ? 'No active orders yet.'
                : 'No completed orders yet.'}
            </p>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;

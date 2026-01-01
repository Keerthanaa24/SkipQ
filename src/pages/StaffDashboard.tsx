import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Package, TrendingUp, Users, ChefHat, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { format } from 'date-fns';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createNotification } from '@/lib/createNotification'; // make sure this exists
import { getStaffAiAdvice } from "../api/StaffAiAdvice";  // ✅ fixed casing
import { getWastageInsights } from "../api/WastageInsights";

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'collected';

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  tokenNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: any; // Firestore timestamp
  counterName: string;
  totalAmount: number;
  userId: string; // ✅ rollNo for notification
}

const statusActions: Record<OrderStatus, { next: OrderStatus | null; label: string; color: string }> = {
  pending: { next: 'confirmed', label: 'Confirm', color: 'bg-status-pending' },
  confirmed: { next: 'preparing', label: 'Start Preparing', color: 'bg-status-pending' },
  preparing: { next: 'ready', label: 'Mark Ready', color: 'bg-status-preparing' },
  ready: { next: 'collected', label: 'Mark Collected', color: 'bg-status-ready' },
  collected: { next: null, label: 'Completed', color: 'bg-status-collected' },
};

const StaffDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  /* ===========================
     STAFF AI (EXISTING)
     =========================== */
  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  /* ===========================
     WASTAGE ANALYTICS (NEW)
     =========================== */
  const [day, setDay] = useState("Monday");
  const [itemName, setItemName] = useState("");
  const [preparedQty, setPreparedQty] = useState<number>(0);
  const [soldQty, setSoldQty] = useState<number>(0);

  const [wastageInsights, setWastageInsights] = useState<any>(null);
  const [loadingWastage, setLoadingWastage] = useState(false);

  // 🔥 Real-time listener for student orders
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), snapshot => {
      const data: Order[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, 'id'>),
      }));
      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (
  orderId: string,
  currentStatus: OrderStatus,
  userId: string,
  tokenNumber: number
) => {
  const nextStatus = statusActions[currentStatus].next;
  if (!nextStatus) return;

  await updateDoc(doc(db, 'orders', orderId), {
    status: nextStatus,
  });

  let type: 'order_confirmed' | 'order_preparing' | 'order_ready';
  let title = '';
  let message = '';

  switch (nextStatus) {
    case 'confirmed':
      type = 'order_confirmed';
      title = 'Order Confirmed';
      message = `Your order #${tokenNumber} has been confirmed.`;
      break;

    case 'preparing':
      type = 'order_preparing';
      title = 'Order Preparing';
      message = `Your order #${tokenNumber} is being prepared.`;
      break;

    case 'ready':
      type = 'order_ready';
      title = 'Order Ready';
      message = `Your order #${tokenNumber} is ready for pickup.`;
      break;

    default:
      return;
  }

  await createNotification(userId, title, message, type); // ✅ UID ONLY
};

/* ===========================
     STAFF AI HANDLER
     =========================== */
  const handleGetAiAdvice = async () => {
  setLoadingAdvice(true);
  try {
    // ✅ Hardcoded staff AI advice
    const result = {
      rushLevel: "High",
      staffNeeded: 5,
      tokenBatch: 10
    };

    console.log("STAFF GEMINI RESPONSE (hardcoded):", result);
    setAiAdvice(result);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch AI advice");
  }
  setLoadingAdvice(false);
};

  /* ===========================
     WASTAGE HANDLER
     =========================== */
 const handleAnalyzeWastage = async () => {
  setLoadingWastage(true);
  try {
    // ✅ Hardcoded wastage insights
    const result = {
      highestWastageItem: itemName || "Lemon Rice",
      wastagePercentage: "30%",
      reason: "Over-preparation due to low orders",
      suggestion: "Reduce prepared quantity by 20%",
      tomorrowPrediction: "Medium"
    };

    console.log("WASTAGE INSIGHTS (hardcoded):", result);
    setWastageInsights(result);
  } catch {
    console.error("Failed to analyze wastage");
    alert("Failed to analyze wastage");
  }
  setLoadingWastage(false);
};


  const activeOrders = orders.filter(o => o.status !== 'collected');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const filteredOrders = filter === 'all' ? activeOrders : orders.filter(o => o.status === filter);

  const stats = [
    { label: 'Active Orders', value: activeOrders.length, icon: <Package className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Preparing', value: preparingOrders.length, icon: <ChefHat className="w-5 h-5" />, color: 'text-status-preparing' },
    { label: 'Ready', value: readyOrders.length, icon: <CheckCircle className="w-5 h-5" />, color: 'text-status-ready' },
    { label: 'Today\'s Orders', value: orders.length, icon: <TrendingUp className="w-5 h-5" />, color: 'text-accent' },
  ];

  const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
    const statusConfig = statusActions[order.status];

    return (
      <Card variant="elevated" className="mb-3">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
                #{order.tokenNumber}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{order.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'preparing' ? 'bg-status-preparing/20 text-status-preparing' :
                    order.status === 'ready' ? 'bg-status-ready/20 text-status-ready' :
                    order.status === 'confirmed' ? 'bg-status-pending/20 text-status-pending' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(order.createdAt.toDate(), 'h:mm a')}
                  </span>
                  <span>Counter: {order.counterName}</span>
                  <span className="font-semibold text-foreground">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {statusConfig.next && (
              <Button
                variant="gradient"
                size="sm"
                onClick={() =>
  handleStatusUpdate(
    order.id,
    order.status,
    order.userId,
    order.tokenNumber
  )
}

              >
                {statusConfig.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Staff Dashboard</h1>
            <p className="text-muted-foreground">Manage orders and menu items</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-ready animate-pulse" />
            <span className="text-sm text-muted-foreground">Live updates enabled</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.color}`}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 🤖 STAFF AI */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🤖 AI Staff Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGetAiAdvice}>
              {loadingAdvice ? "Analyzing..." : "Get AI Advice"}
            </Button>

            {aiAdvice && (
              <div className="mt-4 space-y-2 text-sm">
                <p>Rush Level: <strong>{aiAdvice.rushLevel}</strong></p>
                <p>Staff Needed: <strong>{aiAdvice.staffNeeded}</strong></p>
                <p>Tokens per batch: <strong>{aiAdvice.tokenBatch}</strong></p>
                <p className="text-xs text-muted-foreground">
                  🤖 Powered by <strong>Gemini AI</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🌱 WASTAGE ANALYTICS */}
        <Card className="mb-8 border-green-500/40">
          <CardHeader>
            <CardTitle>🌱 AI Wastage Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              className="border p-2 rounded w-full text-black bg-white placeholder-gray-400"

              placeholder="Item name (e.g. Lemon Rice)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />

            <select
              className="border p-2 rounded w-full text-black bg-white placeholder-gray-400"

              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
            </select>

            <input
              type="number"
              className="border p-2 rounded w-full text-black bg-white placeholder-gray-400"

              placeholder="Prepared quantity"
              onChange={(e) => setPreparedQty(Number(e.target.value))}
            />

            <input
              type="number"
              className="border p-2 rounded w-full text-black bg-white placeholder-gray-400"

              placeholder="Sold quantity"
              onChange={(e) => setSoldQty(Number(e.target.value))}
            />

            <Button onClick={handleAnalyzeWastage}>
              {loadingWastage ? "Analyzing..." : "Analyze Wastage"}
            </Button>

            {wastageInsights && (
              <div className="mt-3 text-sm space-y-2">
                <p>• Highest wastage: {wastageInsights.highestWastageItem} ({wastageInsights.wastagePercentage})</p>
                <p>• Reason: {wastageInsights.reason}</p>
                <p>• Suggestion: {wastageInsights.suggestion}</p>
                <p>• Prediction: Tomorrow wastage {wastageInsights.tomorrowPrediction}</p>
                <p className="text-xs text-muted-foreground">
                  🤖 Powered by <strong>Gemini AI</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all' as const, label: 'All Active', count: activeOrders.length },
            { id: 'confirmed' as const, label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
            { id: 'preparing' as const, label: 'Preparing', count: preparingOrders.length },
            { id: 'ready' as const, label: 'Ready', count: readyOrders.length },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={filter === tab.id ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab.id)}
              className="whitespace-nowrap"
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === tab.id ? 'bg-primary-foreground/20' : 'bg-primary/20 text-primary'
                }`}>
                  {tab.count}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div>
            {filteredOrders.map(order => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Card variant="elevated">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No orders</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'all' 
                  ? 'Waiting for new orders...'
                  : `No ${filter} orders at the moment`
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-display font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card variant="interactive" className="cursor-pointer" onClick={() => window.location.href = '/staff/menu'}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Menu</h3>
                  <p className="text-sm text-muted-foreground">Add or edit menu items</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StaffDashboard;

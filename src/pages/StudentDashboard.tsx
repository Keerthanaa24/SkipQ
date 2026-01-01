import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Clock,
  ShoppingCart,
  History,
  TrendingUp,
  Bell,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders, Order as OrderType } from "@/contexts/OrderContext";
import OrderCard from "@/components/orders/OrderCard";

import MonthlyExpenseCard from "@/components/expenses/MonthlyExpenseCard";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";
import ExpenseList from "@/components/expenses/ExpenseList";

// ✅ Corrected import path for TypeScript
import { predictRush } from "../api/rushPrediction";
import ExpenseQuickStats from "@/components/expenses/ExpenseQuickStats";
import ExpenseCategoryBreakdown from "@/components/expenses/ExpenseCategoryBreakdown";

interface Insights {
  bestOrderTime: string;
  currentQueue: number;
  avgWait: string;
  rushHourEnds: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders } = useOrders();

  const [currentOrder, setCurrentOrder] = useState<OrderType | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);

  const [rushResult, setRushResult] = useState<any>(null);
  const [checkingRush, setCheckingRush] = useState(false);

  /* =====================
     ACTIVE ORDER
     ===================== */
  useEffect(() => {
    if (!user?.id || orders.length === 0) return;

    const active = orders
      .filter(
        (o) => o.userId === user.id && o.status !== "collected"
      )
      .sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

    setCurrentOrder(active || null);
  }, [orders, user]);

  useEffect(() => {
  const fetchInsights = async () => {
    try {
      const res = await fetch('/insights');

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Insights = await res.json();
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setInsights(null);
    }
  };

  fetchInsights();
}, []);



  const activeOrders = orders.filter(
    (o) => o.userId === user?.id && o.status !== "collected"
  );

  const recentOrders = orders.filter(
    (o) => o.userId === user?.id && o.status === "collected"
  );

  /* =====================
     RUSH PREDICTOR
     ===================== */
  const handleCheckRush = async () => {
    setCheckingRush(true);
    try {
      const result = await predictRush("Monday", "12:45 PM");
      setRushResult(result);
    } catch {
      alert("Failed to check rush");
    }
    setCheckingRush(false);
  };

  const quickActions = [
    {
      icon: <UtensilsCrossed className="w-6 h-6" />,
      title: "Browse Menu",
      description: "See what's available today",
      to: "/menu",
      gradient: true,
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Active Orders",
      description: `${activeOrders.length} order(s) in progress`,
      to: "/orders",
    },
    {
      icon: <History className="w-6 h-6" />,
      title: "Order History",
      description: "View past orders",
      to: "/orders",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>

        {/* Active Order Banner */}
        {currentOrder && (
          <Card className="mb-6 border-primary/50">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bell />
                <div>
                  <p className="font-semibold">
                    Token #{currentOrder.tokenNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentOrder.status}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  navigate(`/token/${currentOrder.id}`)
                }
              >
                View Token
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((a, i) => (
            <Link key={i} to={a.to}>
              <Card className="p-6 hover:shadow-lg">
                <div className="flex gap-4">
                  {a.icon}
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 🔥 Rush Predictor */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Canteen Rush Predictor
            </h2>

            <Button onClick={handleCheckRush}>
              {checkingRush ? "Checking..." : "Check Rush"}
            </Button>

            {rushResult && (
              <div className="mt-4">
                <p>
                  Current Rush:{" "}
                  <strong>{rushResult.rush}</strong>
                </p>
                <p>
                  Best Time:{" "}
                  <strong>{rushResult.bestTime}</strong>
                </p>
                <p>
                  Wait Time:{" "}
                  <strong>{rushResult.waitTime}</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  🤖 Powered by Gemini AI
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Row: Active Orders & Smart Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Active Orders List */}
          <section>
            <h2 className="text-xl font-bold mb-4">Active Orders</h2>
            <div className="space-y-4">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <Card className="bg-[#0f172a] border-slate-800 border-dashed p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-white">No active orders</h3>
                  <p className="text-sm text-slate-500 mb-6">Start browsing the menu to place your first order!</p>
                  <Button onClick={() => navigate('/menu')} className="bg-blue-600 hover:bg-blue-700">
                    Browse Menu
                  </Button>
                </Card>
              )}
            </div>
          </section>

          {/* Smart Insights (Hardcoded from Image) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Smart Insights</h2>
              <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-600/30 uppercase font-bold tracking-tighter">
                AI Powered
              </span>
            </div>
            <Card className="bg-[#0f172a] border-slate-800 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-blue-600/20 rounded text-blue-500">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Best time to order</h4>
                  <p className="text-sm text-slate-400">
                    Based on historical data, 11:00 AM - 11:30 AM has the shortest wait times.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Current queue</span>
                  <span className="text-yellow-500 font-bold">~12 orders</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Avg. wait time now</span>
                  <span className="text-white font-bold">15 mins</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Rush hour ends</span>
                  <span className="text-green-500 font-bold">in 38 mins</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  🔒 Powered by Google Gemini
                </p>
              </div>
            </Card>
          </section>
        </div>
{/* ================= RECENT ORDERS (Now Above Dashboard) ================= */}
{recentOrders.length > 0 && (
  <div className="mt-8 mb-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold">Recent Orders</h2>
      <Button 
        variant="ghost" 
        className="text-primary hover:bg-primary/10" 
        onClick={() => navigate('/orders')}
      >
        View All
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recentOrders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  </div>
)}

{/* ================= EXPENSE DASHBOARD (Below Recent Orders) ================= */}
<div className="mt-12 space-y-8 bg-[#0B1120] p-6 md:p-8 rounded-2xl border border-slate-800 text-white">

  

  {/* MONTHLY EXPENSE TRACKER (Hardcoded from Image 2) */}
  <section className="pt-4">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-lg">📅</span> Monthly Expense Tracker
        </h2>
        <p className="text-slate-500 text-sm mt-1">Track your food expenses and spending patterns</p>
      </div>
      <span className="text-[10px] font-bold bg-[#1e293b] text-[#3b82f6] px-3 py-1 rounded-full border border-[#3b82f6]/30 uppercase tracking-tighter">
        Real-time Updates
      </span>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Monthly Expenses Card */}
      <Card className="bg-[#0f172a] border-slate-800/50 p-6 flex flex-col justify-between min-h-[200px]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-slate-200">Monthly Expenses</h3>
            <p className="text-xs text-slate-500">Current month total</p>
          </div>
          <div className="p-2 bg-[#1e293b] rounded-lg">
            <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
          </div>
        </div>
        <div>
          <p className="text-4xl font-bold text-[#3b82f6]">₹315</p>
          <p className="text-xs text-slate-400 mt-1">Total spend across 13 orders</p>
        </div>
      </Card>

      {/* Expense Summary */}
      <Card className="bg-[#0f172a] border-slate-800/50 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-slate-200">Expense Summary</h3>
            <p className="text-xs text-slate-500">Category breakdown</p>
          </div>
          <div className="w-5 h-5 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total Spent</span>
            <span className="text-[#3b82f6] font-bold text-xl">₹315</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-800/50 pt-4">
            <span className="text-slate-400 text-sm">Categories Used</span>
            <span className="text-[#3b82f6] font-bold">1</span>
          </div>
          <div className="pt-4">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Category Breakdown</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Food & Dining</span>
              <span className="text-slate-300 font-semibold">₹315</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Expense Details (Items from Image 2) */}
      <Card className="bg-[#0f172a] border-slate-800/50 p-6">
        <h3 className="font-semibold text-slate-200 mb-6">Expense Details</h3>
        <div className="space-y-6">
          {[
            { name: "Tea", time: "1:42 AM", price: "₹10" },
            { name: "Veg Biryani", time: "1:40 AM", price: "₹55" },
            { name: "Chappathi", time: "1:10 AM", price: "₹35" }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-200">{item.name} × 1</p>
                <p className="text-[10px] text-slate-500 uppercase">{item.time} • Counter B</p>
              </div>
              <div className="px-3 py-1 bg-[#1e293b] rounded-xl text-[#3b82f6] text-xs font-bold">
                {item.price}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </section>
  {/* SPENDING INSIGHTS (Hardcoded from Image 1) */}
  <section>
    <div className="flex items-center gap-2 mb-4 text-slate-200">
      <TrendingUp className="w-4 h-4" />
      <h2 className="text-lg font-semibold">Spending Insights</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-[#0f172a] border-slate-800/50 p-8 flex flex-col items-center justify-center text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Avg. Order Value</p>
        <p className="text-3xl font-bold text-[#3b82f6]">₹24</p>
      </Card>
      
      <Card className="bg-[#0f172a] border-slate-800/50 p-8 flex flex-col items-center justify-center text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Orders This Week</p>
        <p className="text-3xl font-bold text-[#3b82f6]">13</p>
      </Card>

      <Card className="bg-[#0f172a] border-slate-800/50 p-8 flex flex-col items-center justify-center text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Favorite Counter</p>
        <p className="text-3xl font-bold text-[#3b82f6]">Counter B</p>
      </Card>
    </div>
  </section>
  
</div>
       

        
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;

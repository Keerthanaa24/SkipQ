import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { NotificationProvider } from '@/contexts/NotificationContext';

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Token from "./pages/Token";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import StaffDashboard from "./pages/StaffDashboard";
import StaffMenu from "./pages/StaffMenu";
import Wallet from "./pages/wallet";
import RushPrediction from "./pages/RushPrediction";
import NotFound from "./pages/NotFound";

import { auth, db } from "@/lib/firebase";

console.log("Firebase Auth:", auth);
console.log("Firebase DB:", db);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ExpenseProvider>
      <AuthProvider>
        <NotificationProvider>
          <WalletProvider>
            <CartProvider>
              <OrderProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/dashboard" element={<StudentDashboard />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/token/:orderId" element={<Token />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/notifications" element={<Notifications />} />
                       <Route path="/rush" element={<RushPrediction />} />
                      <Route path="/staff" element={<StaffDashboard />} />
                      <Route path="/staff/menu" element={<StaffMenu />} />
                      <Route path="/wallet" element={<Wallet />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </OrderProvider>
            </CartProvider>
          </WalletProvider>
        </NotificationProvider>
      </AuthProvider>
    </ExpenseProvider>
  </QueryClientProvider>
);

export default App;

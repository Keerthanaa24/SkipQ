import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Clock, ArrowLeft, ShoppingCart, IndianRupee, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { loadRazorpay, openRazorpay } from '@/lib/razorpay';

type PaymentMethod = 'wallet' | 'upi';

const Cart: React.FC = () => {
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, totalAmount, estimatedTime } = useCart();
  const { createOrder } = useOrders();
  const { balance, deductMoney, hasPin, verifyPin, addMoney } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (paymentMethod === 'wallet') {
      if (!hasPin) {
        toast({
          title: 'Wallet PIN required',
          description: 'Please create a PIN in your wallet first',
          variant: 'destructive',
        });
        navigate('/wallet');
        return;
      }

      if (balance < totalAmount) {
        toast({
          title: 'Insufficient balance',
          description: `You need ₹${totalAmount - balance} more. Add money or use UPI.`,
          variant: 'destructive',
        });
        setShowAddMoneyDialog(true);
        return;
      }

      setPinDialogOpen(true);
    } else {
      await processUPIPayment();
    }
  };

  const processWalletPayment = async () => {
    if (pin.length !== 4) {
      toast({
        title: 'Invalid PIN',
        description: 'Please enter 4-digit PIN',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const isValid = await verifyPin(pin);
      if (!isValid) {
        toast({ title: 'Incorrect PIN', variant: 'destructive' });
        setIsProcessing(false);
        return;
      }

      await deductMoney(totalAmount, `Food Order - ${items.map(item => item.name).join(', ')}`);

      const order = await createOrder(items, totalAmount, 'wallet');

      clearCart();
      setPin('');
      setPinDialogOpen(false);

      toast({
        title: 'Order placed successfully!',
        description: `₹${totalAmount} deducted from wallet. Token: #${order.tokenNumber}`,
      });

      navigate(`/token/${order.id}`);
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processUPIPayment = async () => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to place an order',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Payment gateway failed to load');

      const orderCreated = await new Promise<void>((resolve, reject) => {
        openRazorpay(
          totalAmount,
          {
            name: user.name,
            email: user.email,
          },
          async () => {
            try {
              const order = await createOrder(items, totalAmount, 'upi');
              clearCart();

              toast({
                title: 'Payment successful!',
                description: `Order placed. Token: #${order.tokenNumber}`,
              });

              navigate(`/token/${order.id}`);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          (error: any) => {
            reject(new Error(error || 'Payment cancelled'));
          }
        );
      });
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddMoney = async () => {
    const amount = Number(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount (minimum ₹1)',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingMoney(true);
    try {
      await addMoney(amount);
      toast({
        title: 'Money added successfully!',
        description: `₹${amount} has been added to your wallet`,
      });
      setAddMoneyAmount('');
      setShowAddMoneyDialog(false);
    } catch (error: any) {
      toast({
        title: 'Failed to add money',
        description: error.message || 'Payment was cancelled or failed',
        variant: 'destructive',
      });
    } finally {
      setIsAddingMoney(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some delicious items from the menu to get started!
              </p>
              <Link to="/menu">
                <Button className="w-full">Browse Menu</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
            <div className="space-y-4">
              {items.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <span className="w-8 text-center font-semibold">{item.quantity}</span>

                            <Button
                              variant="default"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <span className="font-bold text-primary">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Estimated pickup time</p>
                    <p className="text-xs text-muted-foreground">~{estimatedTime} minutes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="font-semibold">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'wallet'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setPaymentMethod('wallet')}
                    >
                      <Wallet className="w-5 h-5" />
                      <span className="font-medium text-sm">Wallet</span>
                      <span className="text-xs text-muted-foreground">
                        ₹{balance} available
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'upi'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="font-medium text-sm">UPI / Card</span>
                      <span className="text-xs text-muted-foreground">
                        GPay, PhonePe, Cards
                      </span>
                    </button>
                  </div>

                  {paymentMethod === 'wallet' && balance < totalAmount && (
                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-yellow-800 font-medium mb-1">
                        Insufficient wallet balance
                      </p>
                      <p className="text-xs text-yellow-700">
                        Need ₹{totalAmount - balance} more.
                        <button
                          type="button"
                          className="ml-1 text-primary font-medium hover:underline"
                          onClick={() => setShowAddMoneyDialog(true)}
                        >
                          Add money now
                        </button>
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{totalAmount}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Pay & Generate Token'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Wallet PIN</DialogTitle>
            <DialogDescription>
              Enter your 4-digit PIN to confirm payment of ₹{totalAmount}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit PIN"
              className="text-center text-2xl tracking-widest h-12"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPinDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={processWalletPayment}
                disabled={pin.length !== 4 || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddMoneyDialog} onOpenChange={setShowAddMoneyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Add money to pay with wallet. You need ₹{totalAmount - balance} more.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount to add</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                </span>
                <Input
                  type="number"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-9"
                  min="1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Current balance: ₹{balance} • Needed: ₹{totalAmount - balance}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddMoneyDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddMoney}
                disabled={!addMoneyAmount || isAddingMoney}
              >
                {isAddingMoney ? 'Processing...' : 'Add Money'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;

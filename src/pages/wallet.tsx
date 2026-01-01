import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IndianRupee, Lock, LockKeyhole } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const {
    balance,
    hasPin,
    addMoney,
    createPin,
    updatePin
  } = useWallet();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinMode, setPinMode] = useState<"create" | "update">("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [oldPin, setOldPin] = useState("");

  const handleAddMoney = async () => {
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    setIsAdding(true);
    try {
      await addMoney(amt);
      toast({
        title: "Success!",
        description: `₹${amt} added to your wallet`
      });
      setAmount("");
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handlePinSubmit = async () => {
    if (pinMode === "create") {
      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        toast({ title: "PIN must be 4 digits", variant: "destructive" });
        return;
      }
      if (pin !== confirmPin) {
        toast({ title: "PINs don't match", variant: "destructive" });
        return;
      }

      try {
        await createPin(pin);
        toast({ title: "PIN created successfully" });
        setPinDialogOpen(false);
        setPin("");
        setConfirmPin("");
      } catch (error) {
        toast({ title: "Failed to create PIN", variant: "destructive" });
      }
    } else {
      if (oldPin.length !== 4 || pin.length !== 4) {
        toast({ title: "PIN must be 4 digits", variant: "destructive" });
        return;
      }
      if (pin !== confirmPin) {
        toast({ title: "New PINs don't match", variant: "destructive" });
        return;
      }

      try {
        await updatePin(oldPin, pin);
        toast({ title: "PIN updated successfully" });
        setPinDialogOpen(false);
        setOldPin("");
        setPin("");
        setConfirmPin("");
      } catch (error: any) {
        toast({
          title: error.message || "Failed to update PIN",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <IndianRupee className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SkipQ Wallet</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}</p>
          </div>
        </div>

        <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {pinMode === "create" ? "Create Wallet PIN" : "Update Wallet PIN"}
              </DialogTitle>
              <DialogDescription>
                {pinMode === "create"
                  ? "Set a 4-digit PIN for wallet security"
                  : "Update your existing wallet PIN"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {pinMode === "update" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Old PIN</label>
                  <Input
                    type="password"
                    maxLength={4}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4-digit PIN"
                    className="text-center text-xl tracking-widest"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {pinMode === "create" ? "New PIN" : "New PIN"}
                </label>
                <Input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit PIN"
                  className="text-center text-xl tracking-widest"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Confirm PIN</label>
                <Input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Confirm 4-digit PIN"
                  className="text-center text-xl tracking-widest"
                />
              </div>

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
                  onClick={handlePinSubmit}
                  disabled={pin.length !== 4 || confirmPin.length !== 4}
                >
                  {pinMode === "create" ? "Create PIN" : "Update PIN"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className="text-sm text-muted-foreground mb-2">CURRENT BALANCE</p>
              <h2 className="text-5xl font-bold">₹{balance}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Available for orders and payments
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end space-y-4">
              {!hasPin && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setPinMode("create");
                    setPinDialogOpen(true);
                  }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Create PIN
                </Button>
              )}
              {hasPin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPinMode("update");
                    setPinDialogOpen(true);
                  }}
                >
                  <LockKeyhole className="w-4 h-4 mr-2" />
                  Update PIN
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Input
              type="number"
              placeholder="Enter amount to add"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
              min="1"
            />
            <Button
              onClick={handleAddMoney}
              disabled={isAdding || !amount}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isAdding ? "Processing..." : "Add Money"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Powered by Razorpay • Secure UPI/Card Payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;

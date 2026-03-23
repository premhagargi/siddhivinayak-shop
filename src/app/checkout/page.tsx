"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, CreditCard, Truck, MapPin, Plus, Loader2, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Address {
  id: string;
  label: string;
  isDefault: boolean;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
}

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, loading: cartLoading, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderJustPlaced, setOrderJustPlaced] = useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<"express" | "standard">("express");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");
  const [mobileSummaryExpanded, setMobileSummaryExpanded] = useState(false);
  const [formData, setFormData] = useState({
    label: "Home",
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
    isDefault: false,
  });

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id) {
        setLoadingAddresses(false);
        return;
      }

      setLoadingAddresses(true);
      try {
        const res = await fetch("/api/users/addresses", {
          headers: { Authorization: `Bearer ${user.id}` },
        });

        if (res.ok) {
          const data = await res.json();
          const fetchedAddresses = data.addresses || [];
          
          const sorted = [...fetchedAddresses].sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
          });
          
          setAddresses(sorted);
          
          const defaultAddr = sorted.find(a => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else if (sorted.length > 0) {
            setSelectedAddressId(sorted[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user?.id]);

  // Handle adding new address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/users/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Address added",
          description: "New address has been added.",
        });

        const refreshRes = await fetch("/api/users/addresses", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const fetchedAddresses = refreshData.addresses || [];
          
          const sorted = [...fetchedAddresses].sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
          });
          
          setAddresses(sorted);
          
          const newAddressId = data.id || sorted[sorted.length - 1]?.id;
          if (newAddressId) {
            setSelectedAddressId(newAddressId);
          }
        }

        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add address. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      name: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      phone: "",
      isDefault: false,
    });
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  // Calculate totals
  const subtotal = total;
  const shippingCost = selectedDeliveryMethod === "express" || subtotal > 10000 ? 0 : 500;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shippingCost + gst;

  // Handle placing order
  const handlePlaceOrder = async () => {
    if (!selectedAddress || items.length === 0) return;

    setPlacingOrder(true);
    try {
      const orderItems: OrderItem[] = items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      }));

      const shippingAddress = {
        name: selectedAddress.name,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        country: selectedAddress.country || "India",
        phone: selectedAddress.phone,
        label: selectedAddress.label,
      };

      const paymentDetails = {
        method: selectedPaymentMethod,
        status: "pending",
        transactionId: null,
        paidAt: null,
      };

      const orderPayload = {
        items: orderItems,
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
        paymentDetails,
        shippingMethod: selectedDeliveryMethod,
        userId: user?.id || null,
        guestEmail: user?.email || null,
        summary: {
          subtotal,
          shipping: shippingCost,
          gst,
          discount: 0,
          total: grandTotal,
        },
        metadata: {
          browser: navigator.userAgent,
          platform: "web",
          checkoutStep: "completed",
          currency: "INR",
        },
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers.Authorization = `Bearer ${user.id}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderJustPlaced(true);
        router.push(`/order-confirmation?id=${data.id}`);
        clearCart();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to place order");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        variant: "destructive",
        title: "Order failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0 && !orderJustPlaced) {
      router.push("/cart");
    }
  }, [cartLoading, items.length, router, orderJustPlaced]);

  if (cartLoading || authLoading) {
    return (
      <div className="container mx-auto px-3 pt-4 pb-20 md:px-8 md:pt-6 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Steps for 4-step checkout
  const steps = [
    { num: 1, label: "Address" },
    { num: 2, label: "Delivery" },
    { num: 3, label: "Payment" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="container mx-auto px-0 pt-0 pb-24 md:px-4 md:pt-4 md:pb-20 max-w-5xl">
      {/* Steps Header - Desktop */}
      <div className="hidden md:flex items-center justify-center gap-6 mb-8">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${idx > 0 ? 'opacity-40' : ''}`}>
              <div className={`h-7 w-7 flex items-center justify-center border-2 text-[11px] font-semibold ${
                step >= s.num ? "border-primary bg-primary text-white" : "border-muted text-muted-foreground"
              }`}>
                {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${
                step >= s.num ? "text-primary" : "text-muted-foreground"
              }`}>
                {s.label}
              </span>
            </div>
            {s.num < 4 && <ChevronRight className="h-3 w-3 text-muted ml-4" />}
          </div>
        ))}
      </div>

      {/* Mobile Steps Progress Bar */}
      <div className="md:hidden flex items-center justify-between px-2 py-2.5 bg-background border-b">
        {steps.map((s, idx) => (
          <div key={s.num} className={`flex items-center ${idx > 0 ? 'opacity-40' : ''}`}>
            <div className={`h-6 w-6 flex items-center justify-center border text-[10px] font-semibold rounded-full ${
              step >= s.num ? "border-primary bg-primary text-white" : "border-muted text-muted-foreground"
            }`}>
              {step > s.num ? <CheckCircle2 className="h-3 w-3" /> : s.num}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:gap-5">
        {/* Left Column - Step Content */}
        <div className="md:col-span-7 px-2 md:px-0">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-140px)] md:min-h-0">
              <div className="flex-grow">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </h2>

                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6 mb-4 border border-dashed border-muted">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-xs text-muted-foreground mb-3">No saved addresses found.</p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="h-9 px-5 rounded-sm bg-primary font-medium text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add New Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start justify-between border p-3 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="accent-primary h-3.5 w-3.5 mt-0.5"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5">{addr.name}</p>
                            <p className="text-[11px] text-muted-foreground">{addr.street}, {addr.city}</p>
                            <p className="text-[11px] text-muted-foreground">{addr.pincode} • {addr.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Add Address Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-9 rounded-sm border-dashed border-primary font-medium text-xs text-primary hover:bg-primary/5">
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-sm uppercase tracking-wide">Add New Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddAddress} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="label" className="text-[11px] font-medium uppercase">Label</Label>
                          <select id="label" className="w-full h-9 border rounded-sm px-2 text-sm" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })}>
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-[11px] font-medium uppercase">Full Name</Label>
                          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-sm h-9" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="street" className="text-[11px] font-medium uppercase">Street Address</Label>
                        <Input id="street" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} required className="rounded-sm h-9" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="city" className="text-[11px] font-medium uppercase">City</Label>
                          <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required className="rounded-sm h-9" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="state" className="text-[11px] font-medium uppercase">State</Label>
                          <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required className="rounded-sm h-9" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="pincode" className="text-[11px] font-medium uppercase">Pincode</Label>
                          <Input id="pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} required className="rounded-sm h-9" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-[11px] font-medium uppercase">Phone</Label>
                          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="rounded-sm h-9" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full rounded-sm bg-primary font-medium text-xs" disabled={submitting}>
                        {submitting ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Adding...</> : "Add Address"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Step 1 Button - Bottom on mobile */}
              <div className="md:mt-4 mt-auto pt-4">
                <Button type="button" onClick={() => setStep(2)} disabled={!selectedAddressId} className="w-full h-11 rounded-sm bg-primary font-semibold text-sm disabled:opacity-50">
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-140px)] md:min-h-0">
              <div className="flex-grow">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Delivery Method
                </h2>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between border p-3 cursor-pointer transition-all ${selectedDeliveryMethod === "express" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="delivery" checked={selectedDeliveryMethod === "express"} onChange={() => setSelectedDeliveryMethod("express")} className="accent-primary h-3.5 w-3.5" />
                      <div>
                        <h4 className="text-sm font-medium">Express Premium</h4>
                        <p className="text-[11px] text-muted-foreground">3-5 Business Days</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-accent">Free</span>
                  </label>
                  <label className={`flex items-center justify-between border p-3 cursor-pointer transition-all ${selectedDeliveryMethod === "standard" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="delivery" checked={selectedDeliveryMethod === "standard"} onChange={() => setSelectedDeliveryMethod("standard")} className="accent-primary h-3.5 w-3.5" />
                      <div>
                        <h4 className="text-sm font-medium">Standard Care</h4>
                        <p className="text-[11px] text-muted-foreground">7-10 Business Days</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">₹500</span>
                  </label>
                </div>
              </div>

              {/* Step 2 Buttons - Bottom on mobile */}
              <div className="md:mt-4 mt-auto pt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-10 rounded-sm border-primary font-medium text-xs">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-10 rounded-sm bg-primary font-medium text-xs">Continue to Delivery</Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-140px)] md:min-h-0">
              <div className="flex-grow">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Payment Method
                </h2>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between border p-3 cursor-pointer transition-all ${selectedPaymentMethod === "upi" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="payment" checked={selectedPaymentMethod === "upi"} onChange={() => setSelectedPaymentMethod("upi")} className="accent-primary h-3.5 w-3.5" />
                      <div>
                        <h4 className="text-sm font-medium">UPI</h4>
                        <p className="text-[11px] text-muted-foreground">Pay using UPI apps</p>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-center justify-between border p-3 cursor-pointer transition-all ${selectedPaymentMethod === "card" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="payment" checked={selectedPaymentMethod === "card"} onChange={() => setSelectedPaymentMethod("card")} className="accent-primary h-3.5 w-3.5" />
                      <div>
                        <h4 className="text-sm font-medium">Cards / Net Banking</h4>
                        <p className="text-[11px] text-muted-foreground">Credit, Debit & Net Banking</p>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-center justify-between border p-3 cursor-pointer transition-all ${selectedPaymentMethod === "cod" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="payment" checked={selectedPaymentMethod === "cod"} onChange={() => setSelectedPaymentMethod("cod")} className="accent-primary h-3.5 w-3.5" />
                      <div>
                        <h4 className="text-sm font-medium">Cash on Delivery</h4>
                        <p className="text-[11px] text-muted-foreground">Pay when you receive</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 3 Buttons - Bottom on mobile */}
              <div className="md:mt-4 mt-auto pt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-10 rounded-sm border-primary font-medium text-xs">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1 h-10 rounded-sm bg-primary font-medium text-xs">Review Order</Button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-140px)] md:min-h-0">
              <div className="flex-grow">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Review Order
                </h2>
                
                {/* Delivery Address */}
                <div className="mb-3 p-2.5 border bg-secondary/20">
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Delivery Address</span>
                  </div>
                  {selectedAddress && (
                    <div>
                      <p className="text-sm font-medium">{selectedAddress.name} • {selectedAddress.label}</p>
                      <p className="text-xs text-muted-foreground">{selectedAddress.street}, {selectedAddress.city}</p>
                      <p className="text-xs text-muted-foreground">{selectedAddress.state} {selectedAddress.pincode} • {selectedAddress.phone}</p>
                    </div>
                  )}
                </div>

                {/* Delivery Method */}
                <div className="mb-3 p-2.5 border bg-secondary/20">
                  <div className="flex items-center gap-1 mb-2">
                    <Truck className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Delivery Method</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{selectedDeliveryMethod === "express" ? "Express Premium" : "Standard Care"}</p>
                      <p className="text-xs text-muted-foreground">{selectedDeliveryMethod === "express" ? "3-5 Business Days" : "7-10 Business Days"}</p>
                    </div>
                    <span className="text-sm font-medium">{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-3 p-2.5 border bg-secondary/20">
                  <div className="flex items-center gap-1 mb-2">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Payment Method</span>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedPaymentMethod === "upi" ? "UPI" : selectedPaymentMethod === "card" ? "Cards / Net Banking" : "Cash on Delivery"}
                  </p>
                </div>

                {/* Products - Only shown in Review step */}
                <div className="mb-3 p-2.5 border">
                  <div className="flex items-center gap-1 mb-2">
                    <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Items ({items.length})</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-2">
                        <Link href={`/product/${item.productId}`} className="relative h-12 w-12 bg-muted flex-shrink-0">
                          <Image src={item.image || "/assets/favicon.png"} alt={item.name} fill className="object-cover" />
                        </Link>
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <Link href={`/product/${item.productId}`} className="hover:underline">
                            <h5 className="text-xs font-medium leading-tight line-clamp-1">{item.name}</h5>
                          </Link>
                          <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4 Buttons - Bottom on mobile */}
              <div className="md:mt-4 mt-auto pt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-10 rounded-sm border-primary font-medium text-xs">Back</Button>
                <Button onClick={handlePlaceOrder} disabled={placingOrder || !selectedAddressId} className="flex-1 h-10 rounded-sm bg-accent text-white font-medium text-xs hover:bg-accent/90 disabled:opacity-50">
                  {placingOrder ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Processing...</> : "Place Order"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Desktop Sidebar */}
        <div className="hidden md:block md:col-span-5">
          <div className="bg-secondary/30 p-3 sticky top-20">
            <h2 className="text-sm font-semibold mb-3">Order Summary</h2>
            
            {/* Steps 1-3: Minimal items - Step 4: Full items */}
            {step < 4 ? (
              <div className="mb-2">
                <p className="text-xs text-muted-foreground">{items.length} items • ₹{subtotal.toLocaleString("en-IN")}</p>
              </div>
            ) : (
              <div className="space-y-2 mb-2 max-h-[180px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-2">
                    <div className="relative h-10 w-10 bg-muted flex-shrink-0">
                      <Image src={item.image || "/assets/favicon.png"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <p className="text-[10px] font-medium leading-tight line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[10px] font-medium">₹{item.price?.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Price Breakdown - only show full breakdown on review step */}
            {step === 4 && (
              <div className="space-y-1.5 pt-3 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingCost === 0 ? "text-accent font-medium" : "font-medium"}>
                    {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">GST</span>
                  <span className="font-medium">₹{gst.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between text-sm font-semibold pt-3 border-t border-muted/60 mt-3">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

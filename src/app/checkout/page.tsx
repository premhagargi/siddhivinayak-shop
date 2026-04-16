"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Truck, MapPin, Plus, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATE_LIST, getCitiesForState } from "@/lib/india-locations";
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

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
  const [deliveryConfig, setDeliveryConfig] = useState<any>(null);
  const [loadingDeliveryConfig, setLoadingDeliveryConfig] = useState(true);
  const [isCustomCity, setIsCustomCity] = useState(false);
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

  // Fetch delivery charges config
  useEffect(() => {
    const fetchDeliveryConfig = async () => {
      try {
        const res = await fetch("/api/delivery-charges");
        if (res.ok) {
          const data = await res.json();
          setDeliveryConfig(data.config);
        }
      } catch (error) {
        console.error("Error fetching delivery config:", error);
      } finally {
        setLoadingDeliveryConfig(false);
      }
    };
    fetchDeliveryConfig();
  }, []);

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
    setIsCustomCity(false);
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

  // Calculate delivery charge from config
  const calculateShipping = (subtotalValue: number): number => {
    if (!deliveryConfig) return 0;

    if (deliveryConfig.type === "fixed") {
      if (
        deliveryConfig.freeDeliveryEnabled &&
        deliveryConfig.freeDeliveryThreshold !== null &&
        subtotalValue >= deliveryConfig.freeDeliveryThreshold
      ) {
        return 0;
      }
      return deliveryConfig.fixedCharge || 0;
    }

    // Range-based
    if (!deliveryConfig.ranges || deliveryConfig.ranges.length === 0) return 0;

    const sortedRanges = [...deliveryConfig.ranges].sort(
      (a: any, b: any) => a.minOrderValue - b.minOrderValue
    );

    for (const range of sortedRanges) {
      const max = range.maxOrderValue ?? Infinity;
      if (subtotalValue >= range.minOrderValue && subtotalValue <= max) {
        return range.charge;
      }
    }

    return sortedRanges[sortedRanges.length - 1].charge;
  };

  // Calculate totals
  const subtotal = total;
  const shippingCost = calculateShipping(subtotal);
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shippingCost + gst;

  // Handle placing order with Razorpay
  const handlePlaceOrder = async () => {
    if (!selectedAddress || items.length === 0) return;

    // Initiate Razorpay payment
    setPlacingOrder(true);
    try {
      const orderItems: OrderItem[] = items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      }));

      // Create Razorpay order
      const razorpayRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "INR",
          items: orderItems,
          userId: user?.id || null,
          guestEmail: user?.email || null,
        }),
      });

      if (!razorpayRes.ok) {
        throw new Error("Failed to create payment order");
      }

      const razorpayData = await razorpayRes.json();
      setRazorpayOrderId(razorpayData.id);

      // If demo mode, simulate payment success
      if (razorpayData.demo) {
        await handlePaymentSuccess(razorpayData.id, "demo_payment_id", "demo_signature");
        return;
      }

      // Load Razorpay script dynamically
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: razorpayData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency || "INR",
        name: "Siddhivinayak Shop",
        description: "Order Payment",
        handler: async (response: any) => {
          await handlePaymentSuccess(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: selectedAddress.name,
          contact: selectedAddress.phone,
          email: user?.email || "",
        },
        theme: {
          color: "#B89B5E",
        },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay modal without completing payment
            setPlacingOrder(false);
          },
        },
      });

      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: response.error.description || "Your payment didn't go through. Please try again.",
        });
        setPlacingOrder(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      const errorData = error.response?.data;
      const errorMessage = errorData?.details || errorData?.error || error.message || "Unknown error";
      
      // Show the actual error message from the server
      toast({
        variant: "warning",
        title: "Payment Error",
        description: errorMessage,
      });
      setPlacingOrder(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (rzpOrderId: string, paymentId: string, signature: string) => {
    try {
      // Verify payment signature
      const verifyRes = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          orderId: razorpayOrderId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        // Signature mismatch — mark order as pending so webhook can reconcile
        toast({
          title: "Verification Pending",
          description: "Your payment is being verified. We'll confirm your order shortly.",
        });
        await createOrderDirectly(paymentId, "pending");
        return;
      }

      // Signature valid — create order as paid
      await createOrderDirectly(paymentId, "paid");
    } catch (error: any) {
      console.error("Error processing payment:", error);
      // Network error during verification — still create order as pending
      // The webhook will reconcile the final payment status
      toast({
        title: "Processing Order",
        description: "We're confirming your payment. You'll receive an update shortly.",
      });
      try {
        await createOrderDirectly(paymentId, "pending");
      } catch {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Your payment was received but we couldn't create your order. Please contact support with your payment ID: " + paymentId,
        });
        setPlacingOrder(false);
      }
    }
  };

  // Create order directly (for COD or after successful payment)
  const createOrderDirectly = async (transactionId?: string, paymentStatus: string = "pending", retried: boolean = false) => {
    if (!selectedAddress) return;
    
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
        status: paymentStatus,
        transactionId: transactionId || null,
        paidAt: transactionId ? new Date().toISOString() : null,
        razorpayOrderId: razorpayOrderId || null,
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
          razorpayOrderId: razorpayOrderId,
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

      // If payment was already taken (transactionId exists), this is critical —
      // the user paid but the order wasn't saved. Retry once automatically.
      if (transactionId && !retried) {
        console.log("Retrying order creation after payment...");
        try {
          await createOrderDirectly(transactionId, paymentStatus, true);
          return; // Retry succeeded
        } catch {
          // Retry also failed — show support message with payment ID
        }
      }

      const errorMessage = transactionId
        ? `Your payment was received but order creation failed. Please contact support with payment ID: ${transactionId}`
        : error.message || "Something went wrong. Please try again.";

      toast({
        variant: "destructive",
        title: transactionId ? "Order Issue" : "Order Failed",
        description: errorMessage,
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const summaryActionLabel =
    step === 1
      ? "Continue to Delivery"
      : step === 2
        ? "Continue to Payment"
        : step === 3
          ? "Review Order"
          : "Place Order";

  const summaryActionDisabled =
    step === 1
      ? !selectedAddressId
      : step === 4
        ? placingOrder || !selectedAddressId
        : false;

  const handleSummaryAction = () => {
    if (step < 4) {
      setStep((prev) => Math.min(prev + 1, 4));
    } else {
      handlePlaceOrder();
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
      <div className="hidden md:flex items-center justify-center gap-4 mb-8 border border-muted/40 rounded-2xl bg-white px-6 py-4 shadow-sm">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => s.num < step && setStep(s.num)}
              className={`text-[10px] tracking-[0.4em] uppercase transition ${
                step === s.num
                  ? "text-primary font-semibold"
                  : step > s.num
                    ? "text-primary/90 hover:text-primary"
                    : "text-muted-foreground cursor-not-allowed"
              }`}
              disabled={s.num >= step}
            >
              {s.label}
            </button>
            {idx < steps.length - 1 && (
              <span className="text-muted-foreground/50 text-[11px] tracking-[0.6em]">
                ----------
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Steps Progress Bar */}
      <div className="md:hidden flex flex-col gap-3 px-3 py-3 bg-background border-b border-muted shadow-[0_1px_2px_rgba(15,23,42,0.07)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Step {step} of {steps.length}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {steps.find(s => s.num === step)?.label || "Checkout"}
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-semibold text-foreground">
              {step}/{steps.length}
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Checkout
            </span>
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full bg-muted-foreground/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.35em] text-muted-foreground">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-1">
              <div
                className={`h-6 w-6 flex items-center justify-center rounded-full border text-[10px] font-semibold ${
                  step >= s.num
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  s.num
                )}
              </div>
              <span className={`text-[8px] leading-none ${step === s.num ? "text-primary" : ""}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:gap-5">
        {/* Left Column - Step Content */}
        <div className="md:col-span-7 px-0 pb-32 md:pb-0">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-140px)] md:min-h-0 space-y-4">
              <section className="space-y-6 bg-white border border-muted/40 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold">Select Delivery Address</p>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Default address</p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-9 px-4 rounded-full text-xs font-semibold uppercase tracking-[0.3em]">
                        <Plus className="h-3.5 w-3.5 mr-1" />
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
                            <Label htmlFor="state" className="text-[11px] font-medium uppercase">State</Label>
                            <select
                              id="state"
                              className="w-full h-9 border rounded-sm px-2 text-sm"
                              value={formData.state}
                              onChange={(e) => { setIsCustomCity(false); setFormData({ ...formData, state: e.target.value, city: "" }); }}
                              required
                            >
                              <option value="">Select State</option>
                              {STATE_LIST.map((state) => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="city" className="text-[11px] font-medium uppercase">City</Label>
                            {formData.state && getCitiesForState(formData.state).length > 0 && !isCustomCity ? (
                              <select
                                id="city"
                                className="w-full h-9 border rounded-sm px-2 text-sm"
                                value={formData.city}
                                onChange={(e) => {
                                  if (e.target.value === "__other") {
                                    setIsCustomCity(true);
                                    setFormData({ ...formData, city: "" });
                                  } else {
                                    setFormData({ ...formData, city: e.target.value });
                                  }
                                }}
                                required
                              >
                                <option value="">Select City</option>
                                {getCitiesForState(formData.state).map((city) => (
                                  <option key={city} value={city}>{city}</option>
                                ))}
                                <option value="__other">Other</option>
                              </select>
                            ) : (
                              <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required className="rounded-sm h-9" placeholder={formData.state ? "Enter city name" : "Select state first"} />
                            )}
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

                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-muted rounded-xl bg-muted/5">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-xs text-muted-foreground mb-3">No saved addresses found.</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="h-9 px-5 rounded-full bg-primary font-medium text-xs">
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`flex flex-col gap-3 border rounded-xl p-4 shadow-sm transition ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-muted/40 bg-background"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="accent-primary h-4 w-4 mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-semibold text-accent border border-accent/40 bg-accent/10 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{addr.name}</p>
                            <p className="text-[11px] text-muted-foreground leading-tight">
                              {addr.street}, {addr.city}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {addr.pincode} • {addr.phone}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-140px)] md:min-h-0 space-y-4">
              <section className="space-y-5 bg-white border border-muted/40 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold">Delivery Information</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {shippingCost === 0 ? "Free delivery on this order" : "Delivery charges apply"}
                  </p>
                </div>
                {loadingDeliveryConfig ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-primary bg-primary/5 p-4">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="text-sm font-semibold">
                            {shippingCost === 0 ? "Free Delivery" : "Standard Delivery"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">3-5 Business Days</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${shippingCost === 0 ? "text-accent" : ""}`}>
                        {shippingCost === 0 ? "Free" : `₹${shippingCost.toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    {/* Show free delivery threshold hint if applicable */}
                    {deliveryConfig?.type === "fixed" &&
                      deliveryConfig.freeDeliveryEnabled &&
                      deliveryConfig.freeDeliveryThreshold > 0 &&
                      shippingCost > 0 && (
                        <p className="text-[11px] text-accent text-center">
                          Add ₹{(deliveryConfig.freeDeliveryThreshold - subtotal).toLocaleString("en-IN")} more to get free delivery!
                        </p>
                      )}

                    {deliveryConfig?.type === "range-based" && shippingCost > 0 && (() => {
                      const sortedRanges = [...(deliveryConfig.ranges || [])].sort(
                        (a: any, b: any) => a.minOrderValue - b.minOrderValue
                      );
                      const freeRange = sortedRanges.find((r: any) => r.charge === 0);
                      if (freeRange && subtotal < freeRange.minOrderValue) {
                        return (
                          <p className="text-[11px] text-accent text-center">
                            Add ₹{(freeRange.minOrderValue - subtotal).toLocaleString("en-IN")} more to get free delivery!
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-140px)] md:min-h-0 space-y-4">
              <section className="space-y-5 bg-white border border-muted/40 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold">Choose Payment Method</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Secure and fast checkout</p>
                </div>
                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 transition ${
                      selectedPaymentMethod === "upi"
                        ? "border-primary bg-primary/5"
                        : "border-muted/40 bg-background hover:border-primary/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPaymentMethod === "upi"}
                        onChange={() => setSelectedPaymentMethod("upi")}
                        className="accent-primary h-4 w-4"
                      />
                      <div>
                        <h4 className="text-sm font-semibold">UPI</h4>
                        <p className="text-[11px] text-muted-foreground">Pay using UPI apps</p>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 transition ${
                      selectedPaymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-muted/40 bg-background hover:border-primary/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPaymentMethod === "card"}
                        onChange={() => setSelectedPaymentMethod("card")}
                        className="accent-primary h-4 w-4"
                      />
                      <div>
                        <h4 className="text-sm font-semibold">Cards / Net Banking</h4>
                        <p className="text-[11px] text-muted-foreground">Credit, Debit & Net Banking</p>
                      </div>
                    </div>
                  </label>
                </div>
              </section>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-140px)] md:min-h-0 space-y-4">
              <section className="space-y-6 bg-white border border-muted/40 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold">Review Order</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Final details before you place the order</p>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-xl bg-background/60 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>Delivery Address</span>
                    </div>
                    {selectedAddress && (
                      <div className="text-sm space-y-1">
                        <p className="font-semibold">
                          {selectedAddress.name} • <span className="text-muted-foreground uppercase tracking-[0.2em]">{selectedAddress.label}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedAddress.street}, {selectedAddress.city}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedAddress.state} {selectedAddress.pincode} • {selectedAddress.phone}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-xl bg-background/60 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      <Truck className="h-3 w-3 text-muted-foreground" />
                      <span>Delivery Method</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{selectedDeliveryMethod === "express" ? "Express Premium" : "Standard Care"}</p>
                        <p className="text-xs text-muted-foreground">{selectedDeliveryMethod === "express" ? "3-5 Business Days" : "7-10 Business Days"}</p>
                      </div>
                      <span className="text-sm font-semibold">{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</span>
                    </div>
                  </div>

                  <div className="border rounded-xl bg-background/60 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      <span>Payment Method</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {selectedPaymentMethod === "upi" ? "UPI" : "Cards / Net Banking"}
                    </p>
                  </div>

                  <div className="border rounded-xl bg-background/60 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                      <span>Items ({items.length})</span>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.productId} className="flex flex-wrap gap-3">
                          <Link href={`/product/${item.productId}`} className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            <Image src={item.image || "/assets/favicon.png"} alt={item.name} fill className="object-cover" />
                          </Link>
                          <div className="flex flex-1 flex-col justify-center min-w-0">
                            <Link href={`/product/${item.productId}`} className="hover:underline">
                              <h5 className="text-sm font-medium line-clamp-1">{item.name}</h5>
                            </Link>
                            <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right Column - Desktop Sidebar */}
        <div className="hidden md:block md:col-span-5">
          <div className="sticky top-20 space-y-4">
            <section className="space-y-4 bg-white border border-muted/40 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Coupons</p>
                <Button variant="outline" className="text-[11px] uppercase tracking-[0.3em] px-3 py-1.5">
                  Apply
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Have a promo code? Apply it to unlock instant savings.
              </p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Delivery Est.</span>
                <span>{selectedDeliveryMethod === "express" ? "3-5 business days" : "7-10 business days"}</span>
              </div>
            </section>

            <section className="space-y-4 bg-white border border-muted/40 rounded-2xl shadow-sm p-5">
              <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Price Details ({items.length} {items.length === 1 ? "item" : "items"})
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingCost === 0 ? "text-accent font-semibold" : ""}>
                    {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span>₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coupon Discount</span>
                  <span>-₹0</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold border-t border-muted/30 pt-3">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                By placing the order, you agree to our Terms of Use and Privacy Policy.
              </p>
              <Button
                onClick={handleSummaryAction}
                disabled={summaryActionDisabled}
                className="w-full h-12 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 disabled:opacity-60"
              >
                {step === 4 ? (
                  placingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Place Order"
                  )
                ) : (
                  summaryActionLabel
                )}
              </Button>
            </section>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-20 border-t border-muted/70 bg-background/95 px-3 py-3 shadow-[0_-8px_15px_rgba(15,23,42,0.12)] backdrop-blur">
        {step === 1 && (
          <Button type="button" onClick={() => setStep(2)} disabled={!selectedAddressId} className="w-full h-11 rounded-sm bg-primary font-semibold text-sm disabled:opacity-50">
            Proceed to Checkout
          </Button>
        )}
        {step === 2 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-10 rounded-sm border-primary font-medium text-xs">
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1 h-10 rounded-sm bg-primary font-medium text-xs">
              Continue to Payment
            </Button>
          </div>
        )}
        {step === 3 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-10 rounded-sm border-primary font-medium text-xs">
              Back
            </Button>
            <Button onClick={() => setStep(4)} className="flex-1 h-10 rounded-sm bg-primary font-medium text-xs">
              Review Order
            </Button>
          </div>
        )}
        {step === 4 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-10 rounded-sm border-primary font-medium text-xs">
              Back
            </Button>
            <Button onClick={handlePlaceOrder} disabled={placingOrder || !selectedAddressId} className="flex-1 h-10 rounded-sm bg-accent text-white font-medium text-xs hover:bg-accent/90 disabled:opacity-50">
              {placingOrder ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}

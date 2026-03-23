"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, CreditCard, Truck, MapPin, Plus, Loader2, ShoppingBag } from "lucide-react";
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
        // For demo/guest users, use demo addresses
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
          
          // Sort addresses: default first, then by order
          const sorted = [...fetchedAddresses].sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
          });
          
          setAddresses(sorted);
          
          // Set default address as selected (first in sorted list)
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

        // Refresh addresses
        const refreshRes = await fetch("/api/users/addresses", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const fetchedAddresses = refreshData.addresses || [];
          
          // Sort addresses: default first
          const sorted = [...fetchedAddresses].sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
          });
          
          setAddresses(sorted);
          
          // Auto-select the newly added address as shipping address
          // Use the returned ID or find by matching the address data
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
      // Prepare order items
      const orderItems: OrderItem[] = items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      }));

      // Prepare shipping address (full address details)
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

      // Prepare payment details (dummy for now)
      const paymentDetails = {
        method: selectedPaymentMethod,
        status: "pending",
        transactionId: null,
        paidAt: null,
      };

      // Build the complete order payload (e-commerce giants store this data)
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
        // Additional metadata
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
        
        // Mark that order was just placed - this prevents redirect to cart
        setOrderJustPlaced(true);

        // Navigate to order confirmation first (without waiting for clearCart)
        router.push(`/order-confirmation?id=${data.id}`);
        
        // Then clear the cart asynchronously (don't await)
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

  // Redirect if cart is empty (but not if we just placed an order)
  useEffect(() => {
    if (!cartLoading && items.length === 0 && !orderJustPlaced) {
      router.push("/cart");
    }
  }, [cartLoading, items.length, router, orderJustPlaced]);

  if (cartLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 pt-6 pb-20 md:px-8 md:pt-10 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-6 pb-20 md:px-8 md:pt-10 max-w-5xl">
      {/* Steps Header */}
      <div className="flex items-center justify-center gap-4 mb-20 md:gap-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`h-10 w-10 flex items-center justify-center border-2 font-bold ${
              step >= s ? "border-primary bg-primary text-white" : "border-muted text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            <span className={`hidden md:inline text-xs font-bold uppercase tracking-widest ${
              step >= s ? "text-primary" : "text-muted-foreground"
            }`}>
              {s === 1 ? "Shipping" : s === 2 ? "Delivery" : "Payment"}
            </span>
            {s < 3 && <ChevronRight className="h-4 w-4 text-muted hidden md:block" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-7">
          {step === 1 && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 flex items-center gap-3">
                <MapPin className="h-6 w-6" /> Shipping Address
              </h2>

              {/* No Address Message */}
              {loadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 mb-8 border-2 border-dashed border-muted">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">No saved addresses found.</p>
                  <p className="text-xs text-muted-foreground mb-6">Please add an address to continue.</p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="h-12 px-8 rounded-none bg-primary font-bold uppercase tracking-widest"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
              ) : (
                <>
                  {/* Saved Addresses */}
                  <div className="space-y-4 mb-8">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start justify-between border-2 p-4 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="accent-primary h-4 w-4 mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm uppercase">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm mt-1">{addr.name}</p>
                            <p className="text-xs text-muted-foreground">{addr.street}</p>
                            <p className="text-xs text-muted-foreground">
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Phone: {addr.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Add New Address Dialog */}
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) resetForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-14 rounded-none border-primary border-dashed font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="uppercase tracking-widest">Add New Address</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="label" className="text-xs font-bold uppercase">
                              Label
                            </Label>
                            <select
                              id="label"
                              className="w-full h-10 border rounded-none px-3"
                              value={formData.label}
                              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            >
                              <option value="Home">Home</option>
                              <option value="Office">Office</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase">
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                              className="rounded-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="street" className="text-xs font-bold uppercase">
                            Street Address
                          </Label>
                          <Input
                            id="street"
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            required
                            className="rounded-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-xs font-bold uppercase">
                              City
                            </Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              required
                              className="rounded-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state" className="text-xs font-bold uppercase">
                              State
                            </Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              required
                              className="rounded-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pincode" className="text-xs font-bold uppercase">
                              Pincode
                            </Label>
                            <Input
                              id="pincode"
                              value={formData.pincode}
                              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                              required
                              className="rounded-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-bold uppercase">
                              Phone
                            </Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              required
                              className="rounded-none"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full rounded-none bg-primary font-bold uppercase tracking-widest"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Address"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {/* Continue Button */}
              <div className="mt-8">
                <Button 
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedAddressId}
                  className="w-full h-16 rounded-none bg-primary font-bold uppercase tracking-widest disabled:opacity-50"
                >
                  Continue to Delivery
                </Button>
                {!selectedAddressId && addresses.length > 0 && (
                  <p className="text-xs text-destructive text-center mt-2">
                    Please select a shipping address
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 flex items-center gap-3">
                <Truck className="h-6 w-6" /> Delivery Method
              </h2>
              <div className="space-y-4">
                <label 
                  className={`flex items-center justify-between border-2 p-6 cursor-pointer transition-all ${
                    selectedDeliveryMethod === "express" 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="delivery" 
                      checked={selectedDeliveryMethod === "express"}
                      onChange={() => setSelectedDeliveryMethod("express")}
                      className="accent-primary h-4 w-4" 
                    />
                    <div>
                      <h4 className="font-bold text-sm uppercase">Express Premium</h4>
                      <p className="text-xs text-muted-foreground">3-5 Business Days • Insured Shipping</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm uppercase">Free</span>
                </label>
                <label 
                  className={`flex items-center justify-between border-2 p-6 cursor-pointer transition-all ${
                    selectedDeliveryMethod === "standard" 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="delivery" 
                      checked={selectedDeliveryMethod === "standard"}
                      onChange={() => setSelectedDeliveryMethod("standard")}
                      className="accent-primary h-4 w-4" 
                    />
                    <div>
                      <h4 className="font-bold text-sm uppercase">Standard Care</h4>
                      <p className="text-xs text-muted-foreground">7-10 Business Days</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm uppercase">₹500</span>
                </label>
              </div>
              <div className="mt-12 flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 rounded-none border-primary font-bold uppercase tracking-widest">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-16 rounded-none bg-primary font-bold uppercase tracking-widest">
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 flex items-center gap-3">
                <CreditCard className="h-6 w-6" /> Payment Method
              </h2>
              <div className="space-y-4">
                <label 
                  className={`flex items-center justify-between border-2 p-6 cursor-pointer transition-all ${
                    selectedPaymentMethod === "upi" 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={selectedPaymentMethod === "upi"}
                      onChange={() => setSelectedPaymentMethod("upi")}
                      className="accent-primary h-4 w-4" 
                    />
                    <div>
                      <h4 className="font-bold text-sm uppercase">UPI (Scan & Pay)</h4>
                      <p className="text-xs text-muted-foreground">Pay using UPI apps</p>
                    </div>
                  </div>
                </label>
                <label 
                  className={`flex items-center justify-between border-2 p-6 cursor-pointer transition-all ${
                    selectedPaymentMethod === "card" 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={selectedPaymentMethod === "card"}
                      onChange={() => setSelectedPaymentMethod("card")}
                      className="accent-primary h-4 w-4" 
                    />
                    <div>
                      <h4 className="font-bold text-sm uppercase">Cards / Net Banking</h4>
                      <p className="text-xs text-muted-foreground">Credit, Debit Cards & Net Banking</p>
                    </div>
                  </div>
                </label>
                <label 
                  className={`flex items-center justify-between border-2 p-6 cursor-pointer transition-all ${
                    selectedPaymentMethod === "cod" 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={selectedPaymentMethod === "cod"}
                      onChange={() => setSelectedPaymentMethod("cod")}
                      className="accent-primary h-4 w-4" 
                    />
                    <div>
                      <h4 className="font-bold text-sm uppercase">Cash on Delivery</h4>
                      <p className="text-xs text-muted-foreground">Pay when you receive</p>
                    </div>
                  </div>
                </label>
              </div>
              <div className="mt-12 flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-16 rounded-none border-primary font-bold uppercase tracking-widest">
                  Back
                </Button>
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={placingOrder || !selectedAddressId}
                  className="flex-1 h-16 rounded-none bg-accent text-white font-bold uppercase tracking-widest hover:bg-accent/90 disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Purchase"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-secondary/50 p-8 sticky top-40">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-8">Your Order</h2>
            
            {cartLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-8">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <Link href={`/product/${item.productId}`} className="relative h-20 w-16 bg-muted flex-shrink-0 block">
                        <Image 
                          src={item.image || "/assets/favicon.png"} 
                          alt={item.name} 
                          fill 
                          className="object-cover" 
                        />
                      </Link>
                      <div className="flex flex-col justify-center">
                        <Link href={`/product/${item.productId}`} className="hover:underline">
                          <h5 className="text-xs font-bold uppercase">{item.name}</h5>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold mt-1">₹{item.price?.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Selected Address Summary */}
                {selectedAddress && (
                  <div className="mb-6 p-4 border bg-white/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      {step === 1 ? "Ship to" : "Shipping to"}
                    </p>
                    <p className="text-sm font-bold">{selectedAddress.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedAddress.street}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedAddress.phone}</p>
                  </div>
                )}

                <div className="space-y-4 border-t pt-8">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "text-accent" : ""}>
                      {shippingCost === 0 ? "Free" : `₹${shippingCost.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span>GST (5%)</span>
                    <span>₹{gst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold uppercase tracking-tight pt-4 border-t border-muted">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

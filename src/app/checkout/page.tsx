
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ChevronRight, CreditCard, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="container mx-auto px-4 pt-40 pb-20 md:px-8 max-w-5xl">
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
              <form className="grid grid-cols-2 gap-4">
                <div className="col-span-1"><Input className="rounded-none h-14 border-muted" placeholder="First Name" /></div>
                <div className="col-span-1"><Input className="rounded-none h-14 border-muted" placeholder="Last Name" /></div>
                <div className="col-span-2"><Input className="rounded-none h-14 border-muted" placeholder="Street Address" /></div>
                <div className="col-span-1"><Input className="rounded-none h-14 border-muted" placeholder="City" /></div>
                <div className="col-span-1"><Input className="rounded-none h-14 border-muted" placeholder="Postal Code" /></div>
                <div className="col-span-2"><Input className="rounded-none h-14 border-muted" placeholder="Phone Number" /></div>
                <div className="col-span-2 mt-8">
                  <Button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full h-16 rounded-none bg-primary font-bold uppercase tracking-widest"
                  >
                    Continue to Delivery
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 flex items-center gap-3">
                <Truck className="h-6 w-6" /> Delivery Method
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between border-2 border-primary p-6 cursor-pointer bg-secondary/30">
                  <div className="flex items-center gap-4">
                    <input type="radio" name="delivery" checked className="accent-primary h-4 w-4" />
                    <div>
                      <h4 className="font-bold text-sm uppercase">Express Premium</h4>
                      <p className="text-xs text-muted-foreground">3-5 Business Days • Insured Shipping</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm uppercase">Free</span>
                </label>
                <label className="flex items-center justify-between border p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <input type="radio" name="delivery" className="accent-primary h-4 w-4" />
                    <div>
                      <h4 className="font-bold text-sm uppercase">Standard Care</h4>
                      <p className="text-xs text-muted-foreground">7-10 Business Days</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm uppercase">Free</span>
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
                <div className="border p-6 cursor-pointer hover:border-primary transition-colors">
                  <h4 className="font-bold text-sm uppercase mb-4">UPI (Scan & Pay)</h4>
                  <div className="h-32 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground uppercase font-bold">
                    UPI QR Code will be generated
                  </div>
                </div>
                <div className="border p-6 cursor-pointer border-primary bg-secondary/30">
                  <h4 className="font-bold text-sm uppercase mb-4">Cards / Net Banking</h4>
                  <div className="space-y-4">
                    <Input className="rounded-none h-12 border-muted" placeholder="Card Number" />
                    <div className="flex gap-4">
                      <Input className="rounded-none h-12 border-muted" placeholder="MM/YY" />
                      <Input className="rounded-none h-12 border-muted" placeholder="CVV" />
                    </div>
                  </div>
                </div>
                <div className="border p-6 cursor-pointer hover:border-primary transition-colors">
                  <h4 className="font-bold text-sm uppercase">Cash on Delivery</h4>
                </div>
              </div>
              <div className="mt-12 flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-16 rounded-none border-primary font-bold uppercase tracking-widest">
                  Back
                </Button>
                <Button className="flex-1 h-16 rounded-none bg-accent text-white font-bold uppercase tracking-widest hover:bg-accent/90">
                  Complete Purchase
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-secondary/50 p-8 sticky top-40">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-8">Your Order</h2>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-8">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4">
                  <Link href={`/product/${i}`} className="relative h-20 w-16 bg-muted flex-shrink-0 block">
                    <Image src={`https://picsum.photos/seed/${i+10}/200/300`} alt="Product" fill className="object-cover" />
                  </Link>
                  <div className="flex flex-col justify-center">
                    <Link href={`/product/${i}`} className="hover:underline">
                      <h5 className="text-xs font-bold uppercase">Saree Product {i}</h5>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">Qty: 1 • Maroon</p>
                    <p className="text-sm font-bold mt-1">₹24,900</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4 border-t pt-8">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹49,800</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span>Shipping</span>
                <span className="text-accent">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold uppercase tracking-tight pt-4 border-t border-muted">
                <span>Grand Total</span>
                <span>₹49,800</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

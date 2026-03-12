
"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SectionFadeIn from "@/components/animations/SectionFadeIn";

const ADDRESSES_MOCK = [
  {
    id: "1",
    label: "Home",
    isDefault: true,
    name: "Anjali Kapoor",
    street: "45/A, Platinum Towers, Link Road",
    city: "Andheri West, Mumbai, MH 400053",
    country: "India",
    phone: "+91 98765 43210"
  },
  {
    id: "2",
    label: "Office",
    isDefault: false,
    name: "Anjali Kapoor",
    street: "Level 12, Maker Chambers IV, Nariman Point",
    city: "Mumbai, MH 400021",
    country: "India",
    phone: "+91 22 6655 4433"
  }
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(ADDRESSES_MOCK);

  return (
    <SectionFadeIn className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Saved Addresses</h1>
          <p className="text-sm text-muted-foreground">Manage your shipping destinations for a faster checkout.</p>
        </div>
        <Button className="h-14 px-8 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
          <Plus className="h-4 w-4 mr-2" /> Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.map((addr) => (
          <Card key={addr.id} className={`rounded-none border-muted relative ${addr.isDefault ? "ring-1 ring-accent/30" : ""}`}>
            {addr.isDefault && (
              <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-accent">
                <CheckCircle2 className="h-3 w-3" /> Default
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3 text-accent" /> {addr.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="text-sm font-medium leading-relaxed">
                <p>{addr.name}</p>
                <p className="text-muted-foreground">{addr.street}</p>
                <p className="text-muted-foreground">{addr.city}</p>
                <p className="text-muted-foreground">{addr.country}</p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone: {addr.phone}</p>
              </div>
              
              <div className="pt-6 mt-6 border-t flex gap-6">
                <button className="text-[10px] font-bold uppercase tracking-widest hover:text-accent flex items-center gap-2 transition-colors">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button className="text-[10px] font-bold uppercase tracking-widest hover:text-destructive flex items-center gap-2 transition-colors">
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
                {!addr.isDefault && (
                  <button className="text-[10px] font-bold uppercase tracking-widest hover:text-primary ml-auto transition-colors">
                    Set as Default
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionFadeIn>
  );
}

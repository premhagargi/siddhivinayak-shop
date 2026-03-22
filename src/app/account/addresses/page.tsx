"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const res = await fetch("/api/users/addresses", {
          headers: { Authorization: `Bearer ${user.id}` },
        });

        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses || []);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAddresses();
    }
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const url = editingAddress
        ? `/api/users/addresses?addressId=${editingAddress.id}`
        : "/api/users/addresses";
      const method = editingAddress ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({
          title: editingAddress ? "Address updated" : "Address added",
          description: editingAddress
            ? "Your address has been updated successfully."
            : "New address has been added.",
        });

        // Refresh addresses
        const refreshRes = await fetch("/api/users/addresses", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAddresses(data.addresses || []);
        }

        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save address. Please try again.",
      });
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/users/addresses?addressId=${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.id}` },
      });

      if (res.ok) {
        toast({
          title: "Address deleted",
          description: "The address has been removed.",
        });

        setAddresses(addresses.filter((a) => a.id !== addressId));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete address.",
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user?.id) return;

    const address = addresses.find((a) => a.id === addressId);
    if (!address) return;

    try {
      // Send addressId in the body as required by the API
      const res = await fetch("/api/users/addresses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ addressId, isDefault: true }),
      });

      if (res.ok) {
        setAddresses(
          addresses.map((a) => ({
            ...a,
            isDefault: a.id === addressId,
          }))
        );
      } else {
        const data = await res.json();
        console.error("Error setting default:", data.error);
      }
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAddress(null);
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

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 pt-40 pb-12 md:px-8 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Saved Addresses</h1>
          <p className="text-sm text-muted-foreground">
            Manage your shipping destinations for a faster checkout.
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
              <Plus className="h-4 w-4 mr-2" /> Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-widest">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              >
                {editingAddress ? "Update Address" : "Add Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.map((addr) => (
          <Card
            key={addr.id}
            className={`rounded-none border-muted relative ${
              addr.isDefault ? "ring-1 ring-accent/30" : ""
            }`}
          >
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
                <p className="text-muted-foreground">
                  {addr.city}, {addr.state} {addr.pincode}
                </p>
                <p className="text-muted-foreground">{addr.country}</p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Phone: {addr.phone}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t flex gap-6">
                <button
                  onClick={() => openEditDialog(addr)}
                  className="text-[10px] font-bold uppercase tracking-widest hover:text-accent flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-[10px] font-bold uppercase tracking-widest hover:text-destructive flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[10px] font-bold uppercase tracking-widest hover:text-primary ml-auto transition-colors"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

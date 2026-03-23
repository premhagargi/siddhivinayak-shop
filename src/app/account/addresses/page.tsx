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
  const [submitting, setSubmitting] = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
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

    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user?.id) return;

    setDeleting(addressId);
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
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user?.id) return;

    const address = addresses.find((a) => a.id === addressId);
    if (!address) return;

    setSettingDefault(addressId);
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
    } finally {
      setSettingDefault(null);
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
    <div className="space-y-6 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b pb-4 md:pb-8">
        <div className="hidden md:block space-y-2">
          <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">
            Saved Addresses
          </h1>
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
            <Button className="h-10 md:h-14 px-4 md:px-8 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
              <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Add New Address
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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingAddress ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingAddress ? "Update Address" : "Add Address"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {addresses.map((addr) => (
          <Card
            key={addr.id}
            className={`rounded-none border-muted relative ${addr.isDefault ? "ring-1 ring-accent/30" : ""}`}
          >
            {/* Top row: Label + Default badge */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b bg-muted/20">
              <div className="text-[10px] md:text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-accent" /> {addr.label}
              </div>
              {addr.isDefault && (
                <div className="flex items-center gap-1 text-[8px] md:text-[8px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5">
                  <CheckCircle2 className="h-3 w-3" /> Default
                </div>
              )}
            </div>
            
            {/* Content */}
            <CardContent className="px-4 pt-3 pb-3">
              {/* Name */}
              <p className="font-semibold text-sm md:text-sm mb-1">{addr.name}</p>
              
              {/* Address lines */}
              <p className="text-muted-foreground text-xs md:text-sm leading-normal">{addr.street}</p>
              <p className="text-muted-foreground text-xs md:text-sm leading-normal">
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p className="text-muted-foreground text-xs md:text-sm leading-normal">{addr.country}</p>
              
              {/* Phone */}
              <p className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                Phone: {addr.phone}
              </p>
            </CardContent>

            {/* Actions row */}
            <div className="px-4 pb-3 pt-2 border-t flex flex-wrap items-center gap-2 md:gap-6 bg-muted/10">              <button
                onClick={() => openEditDialog(addr)}
                className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest hover:text-accent flex items-center gap-1.5 transition-colors text-primary"
              >
                <Edit2 className="h-3.5 w-3.5" /> <span className="hidden md:inline">Edit</span>
                <span className="md:hidden text-[11px]">Edit</span>
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                disabled={deleting === addr.id}
                className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest hover:text-destructive flex items-center gap-1.5 transition-colors disabled:opacity-50 text-muted-foreground"
              >
                {deleting === addr.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span className="hidden md:inline">{deleting === addr.id ? "Removing..." : "Remove"}</span>
                <span className="md:hidden text-[11px]">{deleting === addr.id ? "..." : "Remove"}</span>
              </button>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  disabled={settingDefault === addr.id}
                  className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-50 text-accent whitespace-normal ml-auto md:ml-auto w-auto md:w-auto text-right"
                >
                  {settingDefault === addr.id ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="hidden md:inline">Setting...</span>
                    </span>
                  ) : (
                    <span className="hidden md:inline">Set as Default</span>
                  )}
                  <span className="md:hidden text-[10px] font-bold">Set Default</span>
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

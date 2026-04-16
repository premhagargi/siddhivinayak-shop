"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Trash2,
  Loader2,
  Save,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DeliveryRange {
  minOrderValue: number | string;
  maxOrderValue: number | string | null;
  charge: number | string;
}

interface DeliveryConfig {
  type: "fixed" | "range-based";
  fixedCharge: number | string;
  freeDeliveryEnabled: boolean;
  freeDeliveryThreshold: number | string | null;
  ranges: DeliveryRange[];
}

export default function DeliveryChargesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<DeliveryConfig>({
    type: "fixed",
    fixedCharge: 0,
    freeDeliveryEnabled: true,
    freeDeliveryThreshold: 0,
    ranges: [],
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/delivery-charges");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig({
            type: data.config.type || "fixed",
            fixedCharge: data.config.fixedCharge ?? 0,
            freeDeliveryEnabled: data.config.freeDeliveryEnabled ?? true,
            freeDeliveryThreshold: data.config.freeDeliveryThreshold ?? 0,
            ranges: data.config.ranges?.length
              ? data.config.ranges
              : [{ minOrderValue: 0, maxOrderValue: 500, charge: 50 }],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching delivery config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    if (config.type === "range-based" && config.ranges.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Add at least one price range.",
      });
      return;
    }

    if (config.type === "range-based") {
      for (let i = 0; i < config.ranges.length; i++) {
        const range = config.ranges[i];
        if (range.minOrderValue === "" || range.charge === "") {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Range ${i + 1}: Min order value and charge are required.`,
          });
          return;
        }
        if (
          range.maxOrderValue !== null &&
          range.maxOrderValue !== "" &&
          Number(range.maxOrderValue) <= Number(range.minOrderValue)
        ) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Range ${i + 1}: Max value must be greater than min value.`,
          });
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        type: config.type,
        fixedCharge: Number(config.fixedCharge) || 0,
        freeDeliveryEnabled: config.freeDeliveryEnabled,
        freeDeliveryThreshold:
          config.type === "fixed" && config.freeDeliveryEnabled
            ? Number(config.freeDeliveryThreshold) || 0
            : null,
        ranges:
          config.type === "range-based"
            ? config.ranges.map((r) => ({
                minOrderValue: Number(r.minOrderValue) || 0,
                maxOrderValue:
                  r.maxOrderValue !== null && r.maxOrderValue !== ""
                    ? Number(r.maxOrderValue)
                    : null,
                charge: Number(r.charge) || 0,
              }))
            : [],
      };

      const res = await fetch("/api/admin/delivery-charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "Saved",
          description: "Delivery charges updated successfully.",
        });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save delivery charges.",
      });
    } finally {
      setSaving(false);
    }
  };

  const addRange = () => {
    const lastRange = config.ranges[config.ranges.length - 1];
    const newMin = lastRange
      ? Number(lastRange.maxOrderValue || 0) + 1
      : 0;
    setConfig({
      ...config,
      ranges: [
        ...config.ranges,
        { minOrderValue: newMin, maxOrderValue: "", charge: 0 },
      ],
    });
  };

  const removeRange = (index: number) => {
    setConfig({
      ...config,
      ranges: config.ranges.filter((_, i) => i !== index),
    });
  };

  const updateRange = (
    index: number,
    field: keyof DeliveryRange,
    value: string | number | null
  ) => {
    const updated = [...config.ranges];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, ranges: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">
            Delivery Charges
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Configure delivery pricing for customer orders.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-6 rounded-none bg-primary font-bold uppercase tracking-widest text-[10px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Charge Type Toggle */}
      <div className="space-y-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Delivery Charge Type
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setConfig({ ...config, type: "fixed" })}
            className={cn(
              "flex flex-col items-start gap-2 border p-5 transition-all",
              config.type === "fixed"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                  config.type === "fixed"
                    ? "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {config.type === "fixed" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <IndianRupee className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold uppercase tracking-wide">
                Fixed Charge
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground pl-7">
              Apply the same delivery fee to all orders (with optional free
              delivery above a threshold).
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setConfig({
                ...config,
                type: "range-based",
                ranges:
                  config.ranges.length > 0
                    ? config.ranges
                    : [
                        { minOrderValue: 0, maxOrderValue: 500, charge: 50 },
                      ],
              })
            }
            className={cn(
              "flex flex-col items-start gap-2 border p-5 transition-all",
              config.type === "range-based"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                  config.type === "range-based"
                    ? "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {config.type === "range-based" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <Truck className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold uppercase tracking-wide">
                Range-Based
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground pl-7">
              Set different delivery charges based on order value ranges.
              Includes free delivery option.
            </p>
          </button>
        </div>
      </div>

      {/* Fixed Charge Config */}
      {config.type === "fixed" && (
        <div className="space-y-5 border border-muted p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Fixed Charge Settings
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide">
                Delivery Charge (INR)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  ₹
                </span>
                <Input
                  type="number"
                  min="0"
                  value={config.fixedCharge}
                  onChange={(e) =>
                    setConfig({ ...config, fixedCharge: e.target.value })
                  }
                  className="rounded-none h-10 pl-8"
                  placeholder="0"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Set to 0 for free delivery on all orders.
              </p>
            </div>
          </div>

          {/* Free delivery threshold */}
          <div className="space-y-3 border-t border-muted pt-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.freeDeliveryEnabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    freeDeliveryEnabled: e.target.checked,
                  })
                }
                className="accent-primary h-4 w-4"
              />
              <span className="text-xs font-bold uppercase tracking-wide">
                Free delivery above a threshold
              </span>
            </label>

            {config.freeDeliveryEnabled && (
              <div className="ml-7 max-w-xs space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide">
                  Free Delivery Above (INR)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={config.freeDeliveryThreshold ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        freeDeliveryThreshold: e.target.value,
                      })
                    }
                    className="rounded-none h-10 pl-8"
                    placeholder="e.g. 1000"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Orders above this amount get free delivery. Set to 0 for
                  always free.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Range-Based Config */}
      {config.type === "range-based" && (
        <div className="space-y-5 border border-muted p-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Price Ranges
            </div>
            <Button
              onClick={addRange}
              variant="outline"
              className="h-8 rounded-none border-muted px-4 text-[10px] font-bold uppercase tracking-widest"
            >
              <Plus className="h-3 w-3 mr-1.5" />
              Add Range
            </Button>
          </div>

          <div className="space-y-3">
            {config.ranges.map((range, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-start md:items-end gap-3 border border-muted/60 p-4 bg-background"
              >
                <div className="flex-1 space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Min Order Value (INR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={range.minOrderValue}
                      onChange={(e) =>
                        updateRange(index, "minOrderValue", e.target.value)
                      }
                      className="rounded-none h-9 pl-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground mb-2" />

                <div className="flex-1 space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Max Order Value (INR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={range.maxOrderValue ?? ""}
                      onChange={(e) =>
                        updateRange(
                          index,
                          "maxOrderValue",
                          e.target.value === "" ? null : e.target.value
                        )
                      }
                      className="rounded-none h-9 pl-8 text-sm"
                      placeholder="No limit"
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    Leave empty for no upper limit.
                  </p>
                </div>

                <div className="flex-1 space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Delivery Charge
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={range.charge}
                      onChange={(e) =>
                        updateRange(index, "charge", e.target.value)
                      }
                      className="rounded-none h-9 pl-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    Set to 0 for free delivery.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => removeRange(index)}
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                  disabled={config.ranges.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="border-t border-muted pt-4 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Preview
            </div>
            <div className="space-y-1">
              {config.ranges
                .sort(
                  (a, b) =>
                    Number(a.minOrderValue) - Number(b.minOrderValue)
                )
                .map((range, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 px-3 bg-muted/20"
                  >
                    <span className="text-muted-foreground">
                      Orders{" "}
                      <span className="font-semibold text-foreground">
                        ₹{Number(range.minOrderValue).toLocaleString("en-IN")}
                      </span>
                      {range.maxOrderValue !== null && range.maxOrderValue !== "" ? (
                        <>
                          {" "}to{" "}
                          <span className="font-semibold text-foreground">
                            ₹{Number(range.maxOrderValue).toLocaleString("en-IN")}
                          </span>
                        </>
                      ) : (
                        " & above"
                      )}
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        Number(range.charge) === 0
                          ? "text-green-600"
                          : "text-foreground"
                      )}
                    >
                      {Number(range.charge) === 0
                        ? "FREE"
                        : `₹${Number(range.charge).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import { User, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionFadeIn from "@/components/animations/SectionFadeIn";

export default function ProfileSettingsPage() {
  return (
    <SectionFadeIn className="space-y-16">
      <div className="space-y-2 border-b pb-8">
        <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4 text-accent" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</label>
                <Input className="rounded-none h-14 border-muted" defaultValue="Anjali" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                <Input className="rounded-none h-14 border-muted" defaultValue="Kapoor" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                <Input className="rounded-none h-14 border-muted" defaultValue="anjali.k@example.com" disabled />
                <p className="text-[9px] text-muted-foreground">Contact concierge to change verified email.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                <Input className="rounded-none h-14 border-muted" defaultValue="+91 98765 43210" />
              </div>
            </div>
            <Button className="h-14 px-12 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
              Save Changes
            </Button>
          </div>

          <div className="space-y-8 pt-12 border-t">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" /> Security
            </h3>
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
                <Input type="password" className="rounded-none h-14 border-muted" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                <Input type="password" className="rounded-none h-14 border-muted" />
              </div>
              <Button variant="outline" className="h-14 px-12 rounded-none border-primary font-bold uppercase tracking-widest text-[10px]">
                Update Password
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-secondary/30 p-8 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Account Status</h4>
            <div className="flex items-center gap-3 text-accent">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-bold uppercase">Verified Member</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              You joined Siddhivinayak Collection on Oct 12, 2023. As a verified member, you enjoy premium shipping and early access to drops.
            </p>
          </div>
        </div>
      </div>
    </SectionFadeIn>
  );
}

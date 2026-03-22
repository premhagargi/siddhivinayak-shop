"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSettingsPage() {
  const { user, profile, profileLoading, loading: authLoading, updateProfile, signOut, refreshProfile } = useAuth();
  const { update: updateSession } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account/login");
    }
  }, [user, authLoading, router]);

  // Use global profile data when available
  useEffect(() => {
    if (profile && !profileLoading) {
      setProfileData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, profileLoading]);

  // Fallback to session name if no profile data
  useEffect(() => {
    if (!profile && !profileLoading && user?.name && !profileData.firstName && !profileData.lastName) {
      const nameParts = user.name.split(" ");
      setProfileData(prev => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
      }));
    }
  }, [profile, profileLoading, user?.name]);

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await updateProfile(profileData);
      
      // Refresh the session with the updated name
      const fullName = [profileData.firstName, profileData.lastName].filter(Boolean).join(" ");
      await updateSession({ name: fullName });
      
      // Refresh global profile
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading) {
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
    <div className="space-y-16">
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
                <Input
                  className="rounded-none h-14 border-muted"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                <Input
                  className="rounded-none h-14 border-muted"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                <Input
                  className="rounded-none h-14 border-muted"
                  value={user.email || ""}
                  disabled
                />
                <p className="text-[9px] text-muted-foreground">Contact support to change verified email.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                <Input
                  className="rounded-none h-14 border-muted"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="h-14 px-12 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>

          <div className="space-y-8 pt-12 border-t">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" /> Security
            </h3>
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
                <Input type="password" className="rounded-none h-14 border-muted" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                <Input type="password" className="rounded-none h-14 border-muted" placeholder="Enter new password" />
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
              <span className="text-xs font-bold uppercase">Active Member</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Your account is active and ready to use. Enjoy seamless shopping experience with saved addresses and order tracking.
            </p>
          </div>

          <div className="p-8 border space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Session</h4>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12 rounded-none border-destructive text-destructive font-bold uppercase tracking-widest text-[10px]"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

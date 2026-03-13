
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock credentials check
    if (username === "admin" && password === "admin@123") {
      localStorage.setItem("isAdminAuthenticated", "true");
      toast({
        title: "Access Granted",
        description: "Welcome to the Siddhivinayak Admin Panel.",
      });
      router.push("/admin/products");
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid credentials. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md rounded-none border-muted shadow-2xl">
        <CardHeader className="space-y-4 pb-8 border-b text-center">
          <CardTitle className="font-headline text-2xl font-bold uppercase tracking-[0.3em]">
            Admin Access
          </CardTitle>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </CardHeader>
        <CardContent className="pt-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-none h-14 pl-12 border-muted" 
                  placeholder="admin" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none h-14 pl-12 border-muted" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 rounded-none bg-primary text-white font-bold uppercase tracking-widest hover:bg-primary/90 transition-all"
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

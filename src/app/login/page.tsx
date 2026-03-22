"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const redirect = searchParams.get("redirect") || "/account";

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirect);
    }
  }, [user, authLoading, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        // Call register API
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        toast({
          title: "Account created",
          description: "Welcome! You are now being signed in...",
        });

        // Auto-login after successful registration
        await signIn(email, password);
        toast({
          title: "Welcome!",
          description: "You have been logged in successfully.",
        });
        router.push(redirect);
        router.refresh();
        return;
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        // Redirect to the originally requested page or account
        router.push(redirect);
        router.refresh();
      }
    } catch (error: any) {
      // Show appropriate error message
      const errorMessage = error?.message || "";
      
      // Login specific errors
      if (!isRegister) {
        if (errorMessage.includes("invalid") || errorMessage.includes("credential") || errorMessage.includes("Incorrect")) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Invalid email/phone or password. Please check your credentials and try again.",
          });
        } else if (errorMessage.includes("not found") || errorMessage.includes("not exist")) {
          toast({
            variant: "destructive",
            title: "Account not found",
            description: "No account found with this email/phone. Please register first.",
          });
        } else if (errorMessage.includes("too many")) {
          toast({
            variant: "destructive",
            title: "Too many attempts",
            description: "Please wait a moment before trying again.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Unable to sign in. Please check your credentials and try again.",
          });
        }
        setIsLoading(false);
        return;
      }
      
      // Registration specific errors
      if (errorMessage.includes("already exists") || errorMessage.includes("exists")) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "An account with this email or phone number already exists. Please sign in instead.",
        });
      } else if (errorMessage.includes("valid email")) {
        toast({
          variant: "destructive",
          title: "Invalid email",
          description: "Please enter a valid email address.",
        });
      } else if (errorMessage.includes("password")) {
        toast({
          variant: "destructive",
          title: "Weak password",
          description: errorMessage,
        });
      } else if (errorMessage.includes("phone")) {
        toast({
          variant: "destructive",
          title: "Invalid phone",
          description: errorMessage,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: errorMessage || "Unable to create account. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Saree Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Saree Collection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-white text-center p-8">
            <h2 className="font-headline text-4xl font-bold uppercase tracking-widest mb-4">
              Siddhivinayak
            </h2>
            <p className="text-lg uppercase tracking-widest opacity-90">
              Collection
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block lg:hidden">
              <h1 className="font-headline text-2xl font-bold uppercase tracking-widest">
                Siddhivinayak
              </h1>
            </Link>
            <h2 className="text-2xl font-bold uppercase tracking-tight mt-6">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isRegister 
                ? "Register to track orders and save your details" 
                : "Sign in to access your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                  className="rounded-none h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-none h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-none h-12 bg-primary text-[10px] font-bold uppercase tracking-[0.2em]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isRegister ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="ml-2 text-primary hover:underline font-medium"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

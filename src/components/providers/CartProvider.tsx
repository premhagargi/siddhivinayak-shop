"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthProvider";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  addedAt: string;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  count: number;
  loading: boolean;
  addItem: (item: Omit<CartItem, "addedAt">) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch cart when user changes
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add user ID if logged in
      if (user?.id) {
        headers.Authorization = `Bearer ${user.id}`;
      }

      const res = await fetch("/api/cart", { headers });
      
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (item: Omit<CartItem, "addedAt">) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers.Authorization = `Bearer ${user.id}`;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers,
        body: JSON.stringify(item),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers.Authorization = `Bearer ${user.id}`;
      }

      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const headers: Record<string, string> = {};

      if (user?.id) {
        headers.Authorization = `Bearer ${user.id}`;
      }

      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const headers: Record<string, string> = {};

      if (user?.id) {
        headers.Authorization = `Bearer ${user.id}`;
      }

      const res = await fetch("/api/cart?clear=true", {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        setItems([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        count,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

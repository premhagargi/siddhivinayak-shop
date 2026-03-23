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
  clearing: boolean;
  removingItem: string | null;
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
  const [clearing, setClearing] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

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
    // Optimistically update the local state first for instant feedback
    const newItem: CartItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    
    const existingIndex = items.findIndex((i) => i.productId === item.productId);
    let previousItems = [...items];
    
    if (existingIndex >= 0) {
      // Update quantity if item already exists
      setItems((prevItems) =>
        prevItems.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      );
    } else {
      // Add new item
      setItems((prevItems) => [...prevItems, newItem]);
    }

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

      if (!res.ok) {
        // Revert on error
        setItems(previousItems);
        throw new Error("Failed to add item");
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      // Revert on error
      setItems(previousItems);
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  // Debounce timer for quantity updates
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const updateQuantity = async (productId: string, quantity: number) => {
    // Optimistically update the local state first for instant feedback
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );

    // Clear any existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce the API call - wait 500ms after user stops clicking
    const timer = setTimeout(async () => {
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

        if (!res.ok) {
          throw new Error("Failed to update quantity");
        }

        const data = await res.json();
        setItems(data.items || []);
      } catch (error) {
        console.error("Error updating cart:", error);
        // Refetch to get correct state on error
        fetchCart();
      }
    }, 500);

    setDebounceTimer(timer);
  };

  const removeItem = async (productId: string) => {
    // Set removing state for spinner
    setRemovingItem(productId);

    // Optimistically update the local state first for instant feedback
    const previousItems = [...items];
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));

    try {
      const headers: Record<string, string> = {};

      if (user?.id) {
        headers.Authorization = `Bearer ${user.id}`;
      }

      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        // Revert on error
        setItems(previousItems);
        throw new Error("Failed to remove item");
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      // Revert on error
      setItems(previousItems);
      console.error("Error removing from cart:", error);
    } finally {
      setRemovingItem(null);
    }
  };

  const clearCart = async () => {
    setClearing(true);
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
    } finally {
      setClearing(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        count,
        loading,
        clearing,
        removingItem,
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

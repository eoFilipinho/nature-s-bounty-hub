import React, { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@/data/products";

type CartItem = Product & { quantity: number };

type CartContextType = {
  items: CartItem[];
  count: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return <CartContext.Provider value={{ items, count, addItem, removeItem }}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

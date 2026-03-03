import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@prisma/client";

export interface CartItem {
  id: string; // unique identifier (could be product.id + size)
  product: Product & { images: { url: string; isPrimary?: boolean }[] };
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  // Getters
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex((i) => i.id === item.id);
          
          if (existingItemIndex > -1) {
            // If item exists, increase quantity
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += item.quantity;
            return { items: newItems };
          }
          
          // New item
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) => 
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      
      totalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },
      totalPrice: () => {
        const state = get();
        return state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
    }),
    {
      name: "sdv-cart", // localStorage key
    }
  )
);

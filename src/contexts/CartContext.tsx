import React, { createContext, useContext, useState, useEffect } from 'react';
import type { MenuItem, CartItem, Restaurant } from '../types/index.js';

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFeeLkr: number;
  minOrderLkr: number;
  subtotalLkr: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: MenuItem, restaurant: Restaurant, quantity?: number, instructions?: string, selectedCustomizations?: string[]) => boolean;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('foodora_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [restaurantId, setRestaurantId] = useState<string | null>(() => {
    return localStorage.getItem('foodora_cart_restaurant_id') || null;
  });

  const [restaurantName, setRestaurantName] = useState<string | null>(() => {
    return localStorage.getItem('foodora_cart_restaurant_name') || null;
  });

  const [deliveryFeeLkr, setDeliveryFeeLkr] = useState<number>(() => {
    const fee = localStorage.getItem('foodora_cart_delivery_fee');
    return fee ? Number(fee) : 200;
  });

  const [minOrderLkr, setMinOrderLkr] = useState<number>(() => {
    const min = localStorage.getItem('foodora_cart_min_order');
    return min ? Number(min) : 800;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('foodora_cart', JSON.stringify(items));
      if (restaurantId) localStorage.setItem('foodora_cart_restaurant_id', restaurantId);
      else localStorage.removeItem('foodora_cart_restaurant_id');

      if (restaurantName) localStorage.setItem('foodora_cart_restaurant_name', restaurantName);
      else localStorage.removeItem('foodora_cart_restaurant_name');

      localStorage.setItem('foodora_cart_delivery_fee', String(deliveryFeeLkr));
      localStorage.setItem('foodora_cart_min_order', String(minOrderLkr));
    } catch (err) {
      console.error('Error saving cart state:', err);
    }
  }, [items, restaurantId, restaurantName, deliveryFeeLkr, minOrderLkr]);

  const subtotalLkr = items.reduce((sum, item) => sum + item.menuItem.priceLkr * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (
    item: MenuItem,
    restaurant: Restaurant,
    quantity = 1,
    instructions?: string,
    selectedCustomizations?: string[]
  ): boolean => {
    // If cart already has items from another restaurant, ask or reset
    if (restaurantId && restaurantId !== restaurant.id && items.length > 0) {
      const confirmSwitch = window.confirm(
        `Your cart contains items from "${restaurantName}". Would you like to clear your cart and start a new order from "${restaurant.name}"?`
      );
      if (!confirmSwitch) {
        return false;
      }
      // Reset cart for new restaurant
      setItems([
        {
          menuItem: item,
          quantity,
          instructions,
          selectedCustomizations,
        },
      ]);
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.name);
      setDeliveryFeeLkr(restaurant.deliveryFeeLkr);
      setMinOrderLkr(restaurant.minOrderLkr);
      setIsCartOpen(true);
      return true;
    }

    // Set restaurant metadata if first item
    if (items.length === 0 || !restaurantId) {
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.name);
      setDeliveryFeeLkr(restaurant.deliveryFeeLkr);
      setMinOrderLkr(restaurant.minOrderLkr);
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.menuItem.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          instructions: instructions || next[existingIndex].instructions,
          selectedCustomizations: selectedCustomizations || next[existingIndex].selectedCustomizations,
        };
        return next;
      }
      return [
        ...prev,
        {
          menuItem: item,
          quantity,
          instructions,
          selectedCustomizations,
        },
      ];
    });

    setIsCartOpen(true);
    return true;
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.menuItem.id === menuItemId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.menuItem.id !== menuItemId);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    localStorage.removeItem('foodora_cart');
    localStorage.removeItem('foodora_cart_restaurant_id');
    localStorage.removeItem('foodora_cart_restaurant_name');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        deliveryFeeLkr,
        minOrderLkr,
        subtotalLkr,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

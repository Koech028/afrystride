import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Phase 2: Add cart logic here
  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id && i.size === product.size);
      if (existing) {
        return prev.map(i => i._id === product._id && i.size === product.size
          ? { ...i, quantity: i.quantity + 1 }
          : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId, size) => {
    setItems(prev => prev.filter(i => !(i._id === productId && i.size === size)));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
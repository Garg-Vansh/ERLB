import { createContext, useContext, useMemo, useState } from 'react';
import { calculateCartTotals } from '../utils/cart.js';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('erlbCartItems');
    return stored ? JSON.parse(stored) : [];
  });

  const [shippingAddress, setShippingAddress] = useState(() => {
    const stored = localStorage.getItem('erlbShippingAddress');
    return stored ? JSON.parse(stored) : null;
  });

  const addToCart = (product, qty) => {
    const existing = cartItems.find((item) => item.product === product._id);
    let updated;

    const payload = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      qty
    };

    if (existing) {
      updated = cartItems.map((item) =>
        item.product === payload.product ? payload : item
      );
    } else {
      updated = [...cartItems, payload];
    }

    setCartItems(updated);
    localStorage.setItem('erlbCartItems', JSON.stringify(updated));
  };

  const removeFromCart = (id) => {
    const updated = cartItems.filter((item) => item.product !== id);
    setCartItems(updated);
    localStorage.setItem('erlbCartItems', JSON.stringify(updated));
  };

  const saveShippingAddress = (address) => {
    setShippingAddress(address);
    localStorage.setItem('erlbShippingAddress', JSON.stringify(address));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('erlbCartItems');
  };

  const totals = calculateCartTotals(cartItems);

  const value = useMemo(
    () => ({
      cartItems,
      shippingAddress,
      addToCart,
      removeFromCart,
      saveShippingAddress,
      clearCart,
      ...totals
    }),
    [cartItems, shippingAddress, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);

export const calculateCartTotals = (cartItems = []) => {
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 699 ? 0 : 59;
  const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

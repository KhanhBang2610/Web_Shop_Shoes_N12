// utils/cartUtils.js
export const getCartKey = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? `cart_${user.id}` : 'cart_guest';
};

export const getCart = () => {
  const cartKey = getCartKey();
  return JSON.parse(localStorage.getItem(cartKey)) || [];
};

export const saveCart = (cart) => {
  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(cart));
  window.dispatchEvent(new Event('storage'));
};

export const clearCart = () => {
  const cartKey = getCartKey();
  localStorage.removeItem(cartKey);
  window.dispatchEvent(new Event('storage'));
};
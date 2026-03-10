import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SEO from '../components/SEO.jsx';

const CartPage = () => {
  const { cartItems, removeFromCart, addToCart, itemsPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const checkoutHandler = () => {
    navigate(isAuthenticated ? '/checkout' : '/login?redirect=/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <section className="section container">
        <SEO title="Cart | ERLB" description="Your ERLB cart" path="/cart" />
        <h1>Your Cart</h1>
        <p>Cart is empty. <Link to="/shop">Go shopping</Link></p>
      </section>
    );
  }

  return (
    <section className="section container cart-layout">
      <SEO title="Cart | ERLB" description="Review your ERLB cart" path="/cart" />
      <div>
        <h1>Your Cart</h1>
        {cartItems.map((item) => (
          <article key={item.product} className="cart-item">
            <img src={item.image} alt={item.name} loading="lazy" />
            <div>
              <Link to={`/product/${item.product}`}>{item.name}</Link>
              <p>Rs {item.price}</p>
            </div>
            <select
              value={item.qty}
              onChange={(e) =>
                addToCart(
                  {
                    _id: item.product,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    countInStock: item.countInStock
                  },
                  Number(e.target.value)
                )
              }
            >
              {[...Array(item.countInStock).keys()].slice(0, 10).map((x) => (
                <option key={x + 1} value={x + 1}>{x + 1}</option>
              ))}
            </select>
            <button className="btn-danger" onClick={() => removeFromCart(item.product)}>Remove</button>
          </article>
        ))}
      </div>

      <aside className="order-card">
        <h3>Order Summary</h3>
        <p>Items: Rs {itemsPrice}</p>
        <button className="btn-primary" onClick={checkoutHandler}>Proceed to Checkout</button>
      </aside>
    </section>
  );
};

export default CartPage;

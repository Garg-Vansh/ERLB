import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import SEO from '../components/SEO.jsx';
import { trackEvent } from '../utils/analytics.js';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPage = () => {
  const {
    cartItems,
    shippingAddress,
    saveShippingAddress,
    clearCart,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(
    shippingAddress || {
      address: '',
      city: '',
      postalCode: '',
      country: 'India'
    }
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentConfig, setPaymentConfig] = useState({ provider: 'razorpay', razorpayKeyId: '' });
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const loadPaymentConfig = async () => {
      const { data } = await api.get('/payments/config');
      setPaymentConfig(data);
    };

    loadPaymentConfig();
  }, []);

  useEffect(() => {
    const loadQuote = async () => {
      if (!formData.postalCode) return;
      try {
        const { data } = await api.post('/shipping/quote', {
          postalCode: formData.postalCode,
          itemsPrice
        });
        setQuote(data);
      } catch {
        setQuote(null);
      }
    };

    loadQuote();
  }, [formData.postalCode, itemsPrice]);

  const markOrderPaid = async (orderId, payload) => {
    await api.put(`/orders/${orderId}/pay`, payload);
  };

  const runRazorpayFlow = async (orderId) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Razorpay SDK failed to load');
      return false;
    }

    const { data } = await api.post('/payments/create-order', { orderId });

    const paymentResult = await new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ERLB',
        description: 'Order Payment',
        order_id: data.id,
        handler: (response) => resolve(response),
        prefill: {
          name: 'ERLB Customer'
        },
        theme: {
          color: '#2e7d32'
        }
      });

      rzp.on('payment.failed', reject);
      rzp.open();
    });

    await api.post('/payments/confirm', {
      orderId,
      ...paymentResult
    });

    await markOrderPaid(orderId, {
      id: paymentResult.razorpay_payment_id,
      status: 'captured',
      signature: paymentResult.razorpay_signature,
      rawPayload: paymentResult
    });

    return true;
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    saveShippingAddress(formData);

    try {
      const payload = {
        orderItems: cartItems,
        shippingAddress: formData,
        paymentMethod,
        paymentGateway: paymentMethod === 'Cash On Delivery' ? 'cod' : paymentConfig.provider,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      const { data } = await api.post('/orders', payload);

      if (paymentMethod !== 'Cash On Delivery') {
        if (paymentConfig.provider === 'razorpay') {
          await runRazorpayFlow(data._id);
        } else {
          toast('Stripe enabled: complete payment via configured Stripe checkout flow/webhook.');
        }
      }

      clearCart();
      trackEvent('order_placed', { value: totalPrice, currency: 'INR' });
      toast.success('Order placed successfully');
      navigate(`/profile?order=${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order creation failed');
    }
  };

  return (
    <section className="section container checkout-layout">
      <SEO title="Checkout | ERLB" description="Complete your ERLB order securely." path="/checkout" />
      <form className="auth-form" onSubmit={placeOrderHandler}>
        <h1>Checkout</h1>
        <input type="text" required placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
        <input type="text" required placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
        <input type="text" required placeholder="Postal code" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
        <input type="text" required placeholder="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />

        <label>Payment Method</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="UPI">UPI / Card (Online)</option>
          <option value="Cash On Delivery">Cash On Delivery</option>
        </select>

        <button className="btn-primary" type="submit">Place Order</button>
      </form>

      <aside className="order-card">
        <h3>Final Summary</h3>
        <p>Items: Rs {itemsPrice}</p>
        <p>Shipping: Rs {shippingPrice}</p>
        <p>Tax: Rs {taxPrice}</p>
        {quote && (
          <>
            <p>Zone: {quote.zone}</p>
            <p>Courier: {quote.courierProvider}</p>
            <p>ETA: {quote.etaDays} days</p>
          </>
        )}
        <hr />
        <h4>Total: Rs {totalPrice}</h4>
      </aside>
    </section>
  );
};

export default CheckoutPage;

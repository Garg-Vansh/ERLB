import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import SEO from '../components/SEO.jsx';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.put('/users/profile', {
        name,
        email,
        phone,
        ...(password ? { password } : {})
      });
      login(data);
      setPassword('');
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const requestRefund = async (orderId, amount) => {
    const reason = window.prompt('Enter refund reason');
    if (!reason) return;

    try {
      await api.post(`/orders/${orderId}/refund`, { reason, amount });
      toast.success('Refund requested');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Refund request failed');
    }
  };

  return (
    <section className="section container profile-grid">
      <SEO title="My Profile | ERLB" description="Manage your ERLB profile and orders" path="/profile" />
      <form className="auth-form" onSubmit={updateProfile}>
        <h1>My Profile</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input value={phone} placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
        <input type="password" placeholder="New password (optional)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary" type="submit">Update</button>
      </form>

      <div>
        <h2>My Orders</h2>
        {loading ? (
          <Loader />
        ) : orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order._id} className="order-item">
                <p><strong>Order:</strong> {order._id.slice(-8).toUpperCase()}</p>
                <p><strong>Total:</strong> Rs {order.totalPrice}</p>
                <p><strong>Paid:</strong> {order.isPaid ? 'Yes' : 'No'} | <strong>Shipping:</strong> {order.shippingStatus}</p>
                <p><strong>Tracking:</strong> {order.trackingId || 'Pending'}</p>
                <p><strong>Refund:</strong> {order.refundStatus}</p>
                {order.isPaid && order.refundStatus === 'none' && (
                  <button className="btn-danger" onClick={() => requestRefund(order._id, order.totalPrice)}>
                    Request Refund
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;

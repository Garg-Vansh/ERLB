import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import SEO from '../components/SEO.jsx';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const setShipping = async (orderId, shippingStatus) => {
    try {
      await api.put(`/orders/${orderId}/shipping`, { shippingStatus });
      toast.success('Shipping updated');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const markRefund = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/refund`, { status });
      toast.success('Refund updated');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Refund update failed');
    }
  };

  return (
    <section className="section container">
      <SEO title="Admin Orders | ERLB" description="Manage ERLB orders, shipping and refunds" path="/admin/orders" />
      <h1>Admin Orders</h1>
      {loading ? <Loader /> : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-item">
              <p><strong>#{order._id.slice(-8).toUpperCase()}</strong> | {order.user?.name || 'N/A'}</p>
              <p>Total: Rs {order.totalPrice} | Paid: {order.isPaid ? 'Yes' : 'No'} | Shipping: {order.shippingStatus}</p>
              <p>Refund: {order.refundStatus}</p>
              <div className="row wrap">
                <button className="btn-secondary" onClick={() => setShipping(order._id, 'packed')}>Packed</button>
                <button className="btn-secondary" onClick={() => setShipping(order._id, 'shipped')}>Shipped</button>
                <button className="btn-secondary" onClick={() => setShipping(order._id, 'in_transit')}>In Transit</button>
                <button className="btn-secondary" onClick={() => setShipping(order._id, 'delivered')}>Delivered</button>
                <button className="btn-danger" onClick={() => markRefund(order._id, 'processing')}>Refund Processing</button>
                <button className="btn-danger" onClick={() => markRefund(order._id, 'refunded')}>Refunded</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminOrdersPage;

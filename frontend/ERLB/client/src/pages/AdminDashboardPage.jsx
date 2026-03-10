import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import SEO from '../components/SEO.jsx';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <section className="section container">
      <SEO title="Admin Dashboard | ERLB" description="Manage ERLB products and orders" path="/admin" />
      <h1>Admin Dashboard</h1>
      <div className="kpi-grid">
        <article className="kpi-card"><h3>Orders</h3><p>{data.stats.orderCount}</p></article>
        <article className="kpi-card"><h3>Products</h3><p>{data.stats.productCount}</p></article>
        <article className="kpi-card"><h3>Users</h3><p>{data.stats.userCount}</p></article>
        <article className="kpi-card"><h3>Sales</h3><p>Rs {data.stats.totalSales.toFixed(2)}</p></article>
      </div>

      <div className="section-head">
        <h2>Actions</h2>
        <div className="row">
          <Link className="btn-secondary" to="/admin/products">Manage Products</Link>
          <Link className="btn-secondary" to="/admin/orders">Manage Orders</Link>
        </div>
      </div>

      <h2>Low Stock</h2>
      <div className="orders-list">
        {data.lowStockProducts.map((item) => (
          <article key={item._id} className="order-item">
            <p><strong>{item.name}</strong></p>
            <p>Stock left: {item.countInStock}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminDashboardPage;

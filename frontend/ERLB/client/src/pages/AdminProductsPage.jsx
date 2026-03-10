import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import SEO from '../components/SEO.jsx';

const emptyForm = {
  name: '',
  price: 0,
  category: '',
  countInStock: 0,
  image: '',
  description: '',
  weight: '150g',
  nutritionHighlights: ''
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      countInStock: Number(form.countInStock),
      nutritionHighlights: form.nutritionHighlights
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }

      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({
      ...product,
      nutritionHighlights: (product.nutritionHighlights || []).join(', ')
    });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <section className="section container admin-layout">
      <SEO title="Admin Products | ERLB" description="Manage ERLB catalog and stock" path="/admin/products" />
      <form className="auth-form" onSubmit={submitHandler}>
        <h1>{editingId ? 'Edit Product' : 'Add Product'}</h1>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <input type="number" placeholder="Stock" value={form.countInStock} onChange={(e) => setForm({ ...form, countInStock: e.target.value })} required />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
        <input placeholder="Weight" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Highlights (comma separated)" value={form.nutritionHighlights} onChange={(e) => setForm({ ...form, nutritionHighlights: e.target.value })} />
        <button className="btn-primary" type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>

      <div>
        <h2>Catalog</h2>
        {loading ? <Loader /> : (
          <div className="orders-list">
            {products.map((product) => (
              <article key={product._id} className="order-item">
                <p><strong>{product.name}</strong></p>
                <p>Rs {product.price} | Stock {product.countInStock}</p>
                <div className="row">
                  <button className="btn-secondary" onClick={() => editProduct(product)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteProduct(product._id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminProductsPage;

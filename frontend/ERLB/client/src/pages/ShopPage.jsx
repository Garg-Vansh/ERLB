import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import SEO from '../components/SEO.jsx';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get('/products', { params: { keyword, category, sort } }),
          api.get('/products/categories')
        ]);
        setProducts(productRes.data.products);
        setCategories(categoryRes.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [keyword, category, sort]);

  const updateQuery = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  return (
    <section className="section container">
      <SEO title="Shop ERLB Snacks" description="Browse ERLB clean-label snack products." path="/shop" />
      <h1>Shop ERLB</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products"
          value={keyword}
          onChange={(e) => updateQuery('keyword', e.target.value)}
        />
        <select value={category} onChange={(e) => updateQuery('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => updateQuery('sort', e.target.value)}>
          <option value="">Newest</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ShopPage;

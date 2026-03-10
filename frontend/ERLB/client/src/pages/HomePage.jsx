import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Hero from '../components/Hero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import SEO from '../components/SEO.jsx';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products?sort=rating');
        setProducts(data.products.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      <SEO
        title="ERLB | Eat Right Live Bright"
        description="Clean-label fruit and millet-based snacks for modern healthy Indian lifestyles."
        path="/"
      />
      <Hero />
      <section id="about" className="section container about-block">
        <h2>ERLB Product Philosophy</h2>
        <p>
          We create innovation-driven daily snacks for all age groups using millet-based
          nutrition and fruit-powered natural sweetness. Our model reduces fruit waste and
          makes clean nutrition accessible.
        </p>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Best Sellers</h2>
          <Link to="/shop">View all</Link>
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
    </>
  );
};

export default HomePage;

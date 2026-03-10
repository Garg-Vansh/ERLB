import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';
import SEO from '../components/SEO.jsx';

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <p className="container section">Product not found.</p>;

  return (
    <section className="section container product-detail">
      <SEO title={`${product.name} | ERLB`} description={product.description} path={`/product/${id}`} />
      <img src={product.image} alt={product.name} loading="lazy" />
      <div>
        <p className="pill">{product.category}</p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="price">Rs {product.price}</p>
        <ul className="highlights">
          {product.nutritionHighlights?.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <div className="row">
          <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
            {[...Array(product.countInStock).keys()].slice(0, 10).map((x) => (
              <option key={x + 1} value={x + 1}>
                {x + 1}
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            disabled={product.countInStock === 0}
            onClick={() => {
              addToCart(product, qty);
              toast.success('Added to cart');
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductPage;

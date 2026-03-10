import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-body">
        <p className="pill">{product.category}</p>
        <Link to={`/product/${product._id}`} className="product-title">
          {product.name}
        </Link>
        <p className="product-meta">{product.weight}</p>
        <div className="product-bottom">
          <strong>Rs {product.price}</strong>
          <button
            className="btn-small"
            onClick={() => addToCart(product, 1)}
            disabled={product.countInStock === 0}
          >
            {product.countInStock === 0 ? 'Out of Stock' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

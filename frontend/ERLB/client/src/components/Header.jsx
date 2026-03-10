import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="header">
      <div className="container nav-wrap">
        <Link to="/" className="logo">
          <span>ERLB</span>
          <small>Eat Right Live Bright</small>
        </Link>

        <nav className="nav-links">
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/cart">Cart ({itemCount})</NavLink>
          <NavLink to="/legal/privacy">Policies</NavLink>
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">{user?.name?.split(' ')[0]}</NavLink>
              <button className="link-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import SEO from '../components/SEO.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      toast.success('Welcome back');
      navigate(redirect);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section container auth-wrap">
      <SEO title="Login | ERLB" description="Login to your ERLB account." path="/login" />
      <form className="auth-form" onSubmit={submitHandler}>
        <h1>Login</h1>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Login'}
        </button>
        <p><Link to="/forgot-password">Forgot password?</Link></p>
        <p>New customer? <Link to="/register">Create account</Link></p>
      </form>
    </section>
  );
};

export default LoginPage;

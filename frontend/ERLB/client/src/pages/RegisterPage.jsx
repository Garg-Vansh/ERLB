import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import SEO from '../components/SEO.jsx';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, phone, password });
      login(data);
      toast.success('Account created');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section container auth-wrap">
      <SEO title="Register | ERLB" description="Create your ERLB account." path="/register" />
      <form className="auth-form" onSubmit={submitHandler}>
        <h1>Create Account</h1>
        <input type="text" required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" required placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Register'}
        </button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </section>
  );
};

export default RegisterPage;

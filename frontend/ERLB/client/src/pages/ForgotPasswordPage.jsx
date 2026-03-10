import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import SEO from '../components/SEO.jsx';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post('/users/forgot-password', { email });
      toast.success(data.message || 'Reset link sent if account exists');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Request failed');
    }
  };

  return (
    <section className="section container auth-wrap">
      <SEO title="Forgot Password | ERLB" description="Reset your ERLB password." path="/forgot-password" />
      <form className="auth-form" onSubmit={submitHandler}>
        <h1>Forgot Password</h1>
        <input
          type="email"
          placeholder="Registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit">
          Send Reset Link
        </button>
      </form>
    </section>
  );
};

export default ForgotPasswordPage;

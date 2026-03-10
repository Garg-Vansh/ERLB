import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import SEO from '../components/SEO.jsx';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await api.post('/users/reset-password', {
        token: searchParams.get('token'),
        password
      });
      toast.success('Password updated');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <section className="section container auth-wrap">
      <SEO title="Reset Password | ERLB" description="Set a new ERLB password." path="/reset-password" />
      <form className="auth-form" onSubmit={submitHandler}>
        <h1>Reset Password</h1>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit">
          Update Password
        </button>
      </form>
    </section>
  );
};

export default ResetPasswordPage;

import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginForm = ({ noWrapper = false, onSwitch }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/api/auth/login', formData);
      // Login returns raw AuthResponse (not wrapped in CustomApiResponse)
      login(response.data);
      toast.success(`Welcome back, ${response.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const body = (
    <div className="p-4 auth-form-body">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <span className="brand-accent">Build</span>
          <span className="brand-primary">Smart</span>
        </h2>
        <p className="text-muted">Sign in to your account</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </Form.Group>

        <Button
          type="submit"
          className="w-100 mb-3 btn-brand"
          disabled={loading}
        >
          {loading ? <LoadingSpinner message="" /> : 'Sign In'}
        </Button>
      </Form>

      <div className="text-center">
        <Link to="/forgot-password" className="text-decoration-none link-accent">
          Forgot Password?
        </Link>
      </div>
      <hr />
      <div className="text-center">
        <span className="text-muted">Don't have an account? </span>
        {onSwitch ? (
          <button type="button" className="btn btn-link p-0 link-primary" onClick={() => onSwitch('signup')}>
            Sign Up
          </button>
        ) : (
          <Link to="/signup" className="text-decoration-none link-primary">Sign Up</Link>
        )}
      </div>
    </div>
  );

  if (noWrapper) return body;

  return (
    <Card className="shadow auth-card">
      <Card.Body>
        {body}
      </Card.Body>
    </Card>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axiosInstance';

const ROLES = [
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'SITE_ENGINEER', label: 'Site Engineer' },
  { value: 'SAFETY_OFFICER', label: 'Safety Officer' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer' },
];

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PHONE_REGEX = /^\d{10}$/;

const SignupForm = ({ noWrapper = false, onSwitch }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'PROJECT_MANAGER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setValidationErrors({ ...validationErrors, [e.target.name]: '' });
  };

  const checkUsernameAvailability = async (value) => {
    if (!value || value.length < 3) {
      setValidationErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
      return false;
    }
    const pathsToTry = [
      `/api/auth/check-username?username=${encodeURIComponent(value)}`,
      `/auth/check-username?username=${encodeURIComponent(value)}`,
      `/api/auth/checkUsername?username=${encodeURIComponent(value)}`,
      `/auth/checkUsername?username=${encodeURIComponent(value)}`,
    ];

    for (const p of pathsToTry) {
      try {
        const res = await API.get(p);
        const available = res.data?.available ?? res.data?.data?.available ?? (res.data && typeof res.data === 'boolean' ? res.data : undefined);
        if (available === false) {
          setValidationErrors(prev => ({ ...prev, username: 'Username is already taken' }));
          return false;
        }
        if (available === true || typeof available === 'undefined') {
          // If backend doesn't provide available flag, assume success (validation will occur on submit)
          setValidationErrors(prev => ({ ...prev, username: '' }));
          return true;
        }
      } catch (err) {
        // Try next path when 404 or network error
        console.debug('checkUsernameAvailability try failed', p, err.response?.status || err.message || err);
        if (err.response && err.response.status !== 404) {
          // If server returned a 4xx/5xx other than 404, stop and surface error indirectly
          break;
        }
        // otherwise continue to next candidate
      }
    }

    // If none of the endpoints confirmed availability, allow form submit and rely on server validation
    return true;
  };

  const validate = () => {
    const errors = {};
    if (!formData.username || formData.username.length < 3 || formData.username.length > 30) {
      errors.username = 'Username must be 3-30 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    }
    if (!PHONE_REGEX.test(formData.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    if (!PASSWORD_REGEX.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, digit, and special character';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // check username availability before submit (best-effort)
    const ok = await checkUsernameAvailability(formData.username);
    if (!ok) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...signupData } = formData;
      // Ensure we include a `name` field where backend expects it (fallback to username)
      const payload = { ...signupData, name: signupData.name || signupData.username };
      console.debug('signup payload', payload);

      // Try common signup endpoint variants if backend uses different base paths
      const postPaths = ['/api/auth/signup', '/auth/signup', '/signup'];
      let response;
      let lastErr;
      for (const p of postPaths) {
        try {
          response = await API.post(p, payload);
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          console.debug('signup attempt failed for', p, e.response?.status || e.message || e);
          // If error is 400, server validated payload and returned errors — stop trying other endpoints
          if (e.response && e.response.status === 400) {
            break;
          }
          // otherwise continue trying other endpoints (e.g., 404)
        }
      }
      if (lastErr && !response) throw lastErr;
      setSuccess(true);
      toast.success(response.data?.message || 'Registration successful!');
    } catch (err) {
      console.debug('signup error response', err.response || err);
      const data = err.response?.data || {};
      const msg = data?.message || data?.error || 'Registration failed';
      // If server returned field-level errors, map them into the form
      const fieldErrors = data?.errors || data?.fieldErrors || data?.errorsList || data?.violations;
      if (fieldErrors) {
        const mapped = {};
        // Handle different shapes: object map, array of {field,message}, or array of strings
        if (Array.isArray(fieldErrors)) {
          // spring-style violations: [{ field: 'email', message: '...' }]
          fieldErrors.forEach((f) => {
            if (f.field && f.message) mapped[f.field] = f.message;
            else if (f.propertyPath && f.message) mapped[f.propertyPath] = f.message;
            else if (typeof f === 'string') mapped['general'] = (mapped['general'] ? mapped['general'] + ' ' : '') + f;
          });
        } else if (typeof fieldErrors === 'object') {
          Object.keys(fieldErrors).forEach((k) => {
            const v = fieldErrors[k];
            mapped[k] = Array.isArray(v) ? v.join(' ') : String(v);
          });
        }
        setValidationErrors(prev => ({ ...prev, ...mapped }));
      }
      // If API returns username-taken message, map it to field error
      if (err.response?.data?.code === 'USERNAME_TAKEN' || /username.*taken/i.test(msg)) {
        setValidationErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const successBody = (
    <div className="p-4 text-center">
      <div className="mb-3">
        <span className="emoji-large">✅</span>
      </div>
      <h4 className="fw-bold heading-primary">Registration Successful!</h4>
      <p className="text-muted">
        Your account is pending admin approval. You will be able to login once an administrator approves your account.
      </p>
      <div className="d-grid">
        {onSwitch ? (
          <Button onClick={() => onSwitch('signin')} className="btn-brand">Go to Login</Button>
        ) : (
          <Button as={Link} to="/login" className="btn-brand">Go to Login</Button>
        )}
      </div>
    </div>
  );

  const body = (
    <div className="p-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <span className="brand-accent">Build</span>
          <span className="brand-primary">Smart</span>
        </h2>
        <p className="text-muted">Create your account</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={(e) => checkUsernameAvailability(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                  isInvalid={!!validationErrors.username}
                  required
                />
                <Form.Control.Feedback type="invalid">{validationErrors.username}</Form.Control.Feedback>
              </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              autoComplete="email"
              isInvalid={!!validationErrors.email}
              required
            />
            <Form.Control.Feedback type="invalid">{validationErrors.email}</Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  autoComplete="tel"
                  isInvalid={!!validationErrors.phone}
                  required
                />
                <Form.Control.Feedback type="invalid">{validationErrors.phone}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select name="role" value={formData.role} onChange={handleChange}>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars, uppercase, lowercase, digit, special"
              autoComplete="new-password"
              isInvalid={!!validationErrors.password}
              required
            />
            <Form.Control.Feedback type="invalid">{validationErrors.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
              isInvalid={!!validationErrors.confirmPassword}
              required
            />
            <Form.Control.Feedback type="invalid">{validationErrors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>

        <Button type="submit" className="w-100 mb-3 btn-brand" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
        </Form>

        <div className="text-center">
          <span className="text-muted">Already have an account? </span>
          {onSwitch ? (
            <button type="button" className="btn btn-link p-0 link-primary" onClick={() => onSwitch('signin')}>
              Sign In
            </button>
          ) : (
            <Link to="/login" className="text-decoration-none link-primary">Sign In</Link>
          )}
        </div>
    </div>
  );

  if (success) {
    if (noWrapper) return successBody;
    return (
      <Card className="shadow auth-card">
        <Card.Body className="p-4 text-center">{successBody}</Card.Body>
      </Card>
    );
  }

  if (noWrapper) return body;

  return (
    <Card className="shadow auth-card">
      <Card.Body>{body}</Card.Body>
    </Card>
  );
};

export default SignupForm;

import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import LoginForm from '../components/auth/LoginForm';
import Hero from '../assets/construction-illustration.svg';

// Fallback photo URL (royalty-free Unsplash). Replace with a local image path if desired:
const PHOTO_URL = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80';

const LoginPage = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <Container className="py-4">
      <Row className="auth-split align-items-center">
        <Col md={6} className="d-none d-md-flex auth-hero">
          <div>
            <div
              className="auth-hero-image"
              style={{ backgroundImage: `url(${PHOTO_URL})` }}
              aria-hidden
            />
            <div className="auth-hero-overlay">
              <h1><span className="brand-accent">Build</span><span className="brand-primary">Smart</span></h1>
              <p>Secure access for your construction team</p>
            </div>
          </div>
        </Col>
        <Col md={6} sm={12} className="d-flex align-items-center justify-content-center">
          <div className={`auth-form ${visible ? 'visible' : ''}`}>
            <LoginForm />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;

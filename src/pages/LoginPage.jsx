import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import LoginForm from '../components/auth/LoginForm';

// Fallback photo URL (royalty-free Unsplash). Replace with a local image path if desired:
const PHOTO_URL = 'https://www.google.com/imgres?q=construction%20image&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-photo%2Fconstruction-site-sunset_23-2152006125.jpg%3Fsemt%3Dais_hybrid%26w%3D740%26q%3D80&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fconstruction-engineering&docid=p7Bij0eNS1fI5M&tbnid=DxDYuElZ5U56vM&vet=12ahUKEwjhv_7yk4GUAxWqV3ADHWdZFRwQnPAOegQIExAB..i&w=740&h=404&hcb=2&ved=2ahUKEwjhv_7yk4GUAxWqV3ADHWdZFRwQnPAOegQIExAB';

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

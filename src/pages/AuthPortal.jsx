import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { CONSTRUCTION_BG } from '../config/background';

const AuthPortal = ({ initial = 'signin' }) => {
  const [mode, setMode] = useState(initial === 'signup' ? 'signup' : 'signin');
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(t);
  }, [mode]);

  // Keep internal mode synced with route/initial prop when navigation occurs
  useEffect(() => {
    setMode(initial === 'signup' ? 'signup' : 'signin');
  }, [initial, location.pathname]);

  return (
    <div className="auth-portal-root">
      <div className="auth-bg" style={{ backgroundImage: `url(${CONSTRUCTION_BG})` }} aria-hidden />
      <Container className="auth-portal-container d-flex align-items-center justify-content-center">
        <div className="glass-card">
          {/* Tab switcher removed per request; bottom links will switch modes via onSwitch prop */}

          <div className={`glass-content ${visible ? 'visible' : ''}`}>
            {mode === 'signin' ? (
              <div className="form-wrapper">
                <LoginForm noWrapper onSwitch={setMode} />
              </div>
            ) : (
              <div className="form-wrapper">
                <SignupForm noWrapper onSwitch={setMode} />
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AuthPortal;

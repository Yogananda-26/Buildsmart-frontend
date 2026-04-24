import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CONSTRUCTION_BG } from '../config/background';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-root">

      <Navbar bg="transparent" expand="lg" className="landing-nav px-4" style={{background:'transparent'}}>
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center gap-2">
            <div className="logo-box">BS</div>
            <span className="fw-bold">BuildSmart</span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#projects">Projects</Nav.Link>
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#about">About</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="landing-hero" style={{ backgroundImage: `url(${CONSTRUCTION_BG})` }}>
        <div className="hero-overlay">
          <div className="hero-content text-white px-3">
            <h1 className="display-4 fw-bold hero-heading">BUILDING THE DREAM, BRICK BY BLUEPRINT.</h1>
            <p className="lead mt-3 hero-sub">Forging the future from your blueprints.</p>

            <div className="mt-4">
              <Button className="btn-join btn-xl" onClick={() => navigate('/login')}>JOIN US</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

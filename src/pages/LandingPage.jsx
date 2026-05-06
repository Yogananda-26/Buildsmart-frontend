import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CONSTRUCTION_BG } from '../config/background';
import { FiTrendingUp, FiShield, FiUsers, FiBarChart2, FiHelpCircle, FiInfo } from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              <Nav.Link onClick={() => scrollToSection('home')}>Home</Nav.Link>
              <Nav.Link onClick={() => scrollToSection('clients')}>Clients</Nav.Link>
              <Nav.Link onClick={() => scrollToSection('features')}>Features</Nav.Link>
              <Nav.Link onClick={() => scrollToSection('help')}>Help</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section - Slogan */}
      <section id="home" className="landing-hero" style={{ backgroundImage: `url(${CONSTRUCTION_BG})` }}>
        <div className="hero-overlay">
          <div className="hero-content text-white px-3">
            <h1 className="display-4 fw-bold hero-heading">"BUILDING THE DREAM, BRICK BY BLUEPRINT."</h1>
            <p className="lead mt-3 hero-sub">Forging the future from your blueprints. We turn visions into reality with precision, innovation, and excellence.</p>
            <div className="mt-4">
              <Button className="btn-join btn-xl" onClick={() => navigate('/login')}>JOIN US</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section id="clients" className="clients-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Trusted by Leading Clients</h2>
              <p className="section-subtitle">We partner with industry leaders to deliver exceptional construction solutions.</p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={3} className="text-center mb-4">
              <div className="client-logo">🏗️</div>
              <h5>ABC Construction</h5>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="client-logo">🏢</div>
              <h5>Urban Developers</h5>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="client-logo">🏠</div>
              <h5>Home Builders Inc.</h5>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="client-logo">🌆</div>
              <h5>City Planners</h5>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Our Key Features</h2>
              <p className="section-subtitle">Comprehensive tools to manage your construction projects efficiently.</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <FiTrendingUp size={50} className="feature-icon mb-3" />
                  <Card.Title>Project Tracking</Card.Title>
                  <Card.Text>Real-time monitoring of project progress, timelines, and milestones.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <FiShield size={50} className="feature-icon mb-3" />
                  <Card.Title>Safety Management</Card.Title>
                  <Card.Text>Ensure compliance with safety standards and track incidents.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <FiUsers size={50} className="feature-icon mb-3" />
                  <Card.Title>Resource Allocation</Card.Title>
                  <Card.Text>Optimize workforce and equipment allocation across projects.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <FiBarChart2 size={50} className="feature-icon mb-3" />
                  <Card.Title>Analytics & Reports</Card.Title>
                  <Card.Text>Generate insightful reports and analytics for better decision-making.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <FiUsers size={50} className="feature-icon mb-3" />
                  <Card.Title>Vendor Management</Card.Title>
                  <Card.Text>Manage vendors, contracts, and procurement efficiently.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <FiUsers size={50} className="feature-icon mb-3" />
                  <Card.Title>User Analytics</Card.Title>
                  <Card.Text>Track user engagement and performance metrics.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Help and About Section */}
      <section id="help" className="help-about-section py-5">
        <Container>
          <Row>
            <Col md={6} className="mb-4">
              <Card className="help-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <FiHelpCircle size={30} className="me-3 text-primary" />
                    <Card.Title>Need Help?</Card.Title>
                  </div>
                  <Card.Text>
                    Our support team is here to assist you. Contact us for any questions or technical support.
                  </Card.Text>
                  <Button variant="outline-primary">Contact Support</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="about-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <FiInfo size={30} className="me-3 text-success" />
                    <Card.Title>About BuildSmart</Card.Title>
                  </div>
                  <Card.Text>
                    BuildSmart is a leading construction management platform that empowers teams to build better, faster, and safer. With cutting-edge technology and user-friendly interfaces, we streamline the entire construction lifecycle.
                  </Card.Text>
                  <Button variant="outline-success">Learn More</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-white py-4">
        <Container>
          <Row>
            <Col md={4} className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="logo-box">BS</div>
                <span className="fw-bold">BuildSmart</span>
              </div>
              <p>Building the future, one project at a time.</p>
            </Col>
            <Col md={4} className="mb-3">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><a href="#home" className="text-white" onClick={() => scrollToSection('home')}>Home</a></li>
                <li><a href="#clients" className="text-white" onClick={() => scrollToSection('clients')}>Clients</a></li>
                <li><a href="#features" className="text-white" onClick={() => scrollToSection('features')}>Features</a></li>
                <li><a href="#help" className="text-white" onClick={() => scrollToSection('help')}>Help</a></li>
              </ul>
            </Col>
            <Col md={4} className="mb-3">
              <h5>Contact Us</h5>
              <p>Email: support@buildsmart.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Construction Ave, Build City, BC 12345</p>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col className="text-center">
              <p>&copy; 2024 BuildSmart. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;

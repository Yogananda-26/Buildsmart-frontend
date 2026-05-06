import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge, Overlay, Popover } from 'react-bootstrap';
import ProfilePreview from '../profile/ProfilePreview';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLORS = {
  ADMIN: 'danger',
  PROJECT_MANAGER: 'primary',
  SITE_ENGINEER: 'success',
  SAFETY_OFFICER: 'warning',
  VENDOR: 'info',
  FINANCE_OFFICER: 'secondary',
};

const formatRole = (role) => {
  if (!role) return 'Guest';
  // Normalize and prettify: PROJECT_MANAGER -> Project Manager
  return role
    .toLowerCase()
    .split(/_|\s+/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};

const AppNavbar = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const profileTarget = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(hideTimer.current);
  }, []);

  const handleTriggerEnter = () => {
    clearTimeout(hideTimer.current);
    setShowProfile(true);
  };

  const handleTriggerLeave = () => {
    hideTimer.current = setTimeout(() => setShowProfile(false), 180);
  };

  const handlePopoverEnter = () => {
    clearTimeout(hideTimer.current);
    setShowProfile(true);
  };

  const handlePopoverLeave = () => {
    hideTimer.current = setTimeout(() => setShowProfile(false), 180);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Hide the global top navbar on dashboard/admin/profile/analytics/login routes
  const hideOnPaths = ['/dashboard', '/admin', '/profile', '/analytics', '/login'];
  if (!isAuthenticated) return null;
  if (hideOnPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <Navbar expand="lg" className="app-navbar shadow-sm" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold navbar-brand">
          <span className="brand-accent">Build</span>Smart
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
            {hasRole('ADMIN') && (
              <NavDropdown title="Admin" id="admin-dropdown">
                <NavDropdown.Item as={Link} to="/admin/users">User Management</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/pending">Pending Approvals</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/audit">Audit Logs</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Nav>
            <div
              ref={profileTarget}
              onMouseEnter={handleTriggerEnter}
              onMouseLeave={handleTriggerLeave}
              style={{ display: 'inline-block' }}
            >
              <Nav.Link as={Link} to="/profile" className="d-flex align-items-center me-3 text-light profile-link">
                <Badge bg={ROLE_COLORS[user?.role] || 'secondary'} className="me-2 role-badge">
                  {formatRole(user?.role)}
                </Badge>
                <span className="">{user?.name || 'Guest'}</span>
              </Nav.Link>
            </div>

            <Overlay target={profileTarget.current} show={showProfile} placement="bottom" container={typeof document !== 'undefined' ? document.body : undefined} popperConfig={{ modifiers: [ { name: 'offset', options: { offset: [0, 8] } }, { name: 'preventOverflow', options: { boundary: 'viewport' } } ] }}>
              <Popover id="profile-popover" className="profile-popover" onMouseEnter={handlePopoverEnter} onMouseLeave={handlePopoverLeave}>
                <Popover.Body className="p-0">
                  <ProfilePreview user={user} />
                </Popover.Body>
              </Popover>
            </Overlay>
            <Nav.Link onClick={handleLogout} className="text-light">
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );

};

export default AppNavbar;

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Navbar, Button, Overlay, Popover } from 'react-bootstrap';
import Sidebar from './Sidebar';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import ProfilePreview from '../profile/ProfilePreview';
import { FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ title = 'Dashboard', children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
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
    if (onLogout) await onLogout();
    navigate('/login');
  };

  // Close sidebar when route changes (desktop & mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const wrapperClass = sidebarOpen ? 'dashboard-wrapper sidebar-open' : 'dashboard-wrapper';

  const prettyRole = (r) => {
    if (!r) return 'Guest';
    return r
      .toLowerCase()
      .split(/_|\s+/)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  };

  return (
    <div className={wrapperClass}>
      <div className="sidebar-col">
        <Sidebar id="app-sidebar" />
      </div>

      {/* Backdrop that dims the page when sidebar is open */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        role="button"
        aria-hidden={!sidebarOpen}
      />

      <div className="main-content flex-grow-1">
        <Navbar bg="light" className="top-navbar px-3" expand={false}>
          <div className="d-flex align-items-center w-100">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                className="me-2 p-0 sidebar-toggle"
                onClick={() => setSidebarOpen(v => !v)}
                aria-label="Toggle sidebar"
                aria-controls="app-sidebar"
                aria-expanded={sidebarOpen}
              >
                <FaBars />
              </Button>
              <div className="me-3">
                <h5 className="mb-0">{title}</h5>
              </div>
            </div>
            <div className="ms-auto d-flex align-items-center gap-2">
                <div
                  ref={profileTarget}
                  onMouseEnter={handleTriggerEnter}
                  onMouseLeave={handleTriggerLeave}
                  style={{ display: 'inline-block' }}
                >
                  <Button variant="link" className="d-flex align-items-center text-muted me-3 p-0 profile-btn" onClick={() => navigate('/profile')}>
                    <FaUserCircle className="me-2" /> {prettyRole(user?.role)}
                  </Button>
                </div>

                <Overlay target={profileTarget.current} show={showProfile} placement="bottom" container={typeof document !== 'undefined' ? document.body : undefined} popperConfig={{ modifiers: [ { name: 'offset', options: { offset: [0, 8] } }, { name: 'preventOverflow', options: { boundary: 'viewport' } } ] }}>
                  <Popover id="profile-popover" className="profile-popover" onMouseEnter={handlePopoverEnter} onMouseLeave={handlePopoverLeave}>
                    <Popover.Body className="p-0">
                      <ProfilePreview user={user} />
                    </Popover.Body>
                  </Popover>
                </Overlay>
              <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
                <FaSignOutAlt className="me-1" /> Logout
              </Button>
            </div>
          </div>
        </Navbar>

        <Container fluid className="p-3">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default DashboardLayout;

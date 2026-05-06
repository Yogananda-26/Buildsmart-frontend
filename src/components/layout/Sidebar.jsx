import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaClipboardList, FaFileAlt, FaChartBar, FaProjectDiagram, FaTools, FaShieldAlt, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'GUEST';

  // Sidebar items with RBAC rules
  const items = [
    { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: <FaTachometerAlt className="me-2" />, roles: ['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'SAFETY_OFFICER', 'VENDOR', 'FINANCE_OFFICER', 'GUEST'] },
    { key: 'finance', label: 'Finance', to: '/analytics/finance', icon: <FaProjectDiagram className="me-2" />, roles: ['ADMIN', 'PROJECT_MANAGER', 'FINANCE_OFFICER'] },
    { key: 'projects', label: 'Projects', to: '/analytics/projects', icon: <FaTools className="me-2" />, roles: ['ADMIN', 'PROJECT_MANAGER'] },
    { key: 'resources', label: 'Resources', to: '/analytics/resources', icon: <FaUserTie className="me-2" />, roles: ['ADMIN', 'PROJECT_MANAGER'] },
    { key: 'safety', label: 'Safety', to: '/analytics/safety', icon: <FaShieldAlt className="me-2" />, roles: ['ADMIN', 'PROJECT_MANAGER', 'SAFETY_OFFICER'] },
    { key: 'vendors', label: 'Vendors', to: '/analytics/vendors', icon: <FaUsers className="me-2" />, roles: ['ADMIN', 'PROJECT_MANAGER', 'VENDOR'] },
    { key: 'users', label: 'User Analytics', to: '/analytics/users', icon: <FaUsers className="me-2" />, roles: ['ADMIN', 'PROJECT_MANAGER'] },
    { key: 'users_admin', label: 'User Management', to: '/admin/users', icon: <FaUsers className="me-2" />, roles: ['ADMIN'] },
    { key: 'pending', label: 'Pending Approvals', to: '/admin/pending', icon: <FaClipboardList className="me-2" />, roles: ['ADMIN'] },
    { key: 'audit', label: 'Audit Logs', to: '/admin/audit', icon: <FaFileAlt className="me-2" />, roles: ['ADMIN'] },
  ];

  // Filter items based on role so they are not rendered in the DOM when unauthorized
  const visibleItems = items.filter(item => item.roles.includes(role));

  const prettyRole = (r) => (r ? r.replace(/_/g, ' ') : 'User');

  return (
    <aside className="sidebar d-flex flex-column p-3 text-white" id="app-sidebar">
      <div className="brand mb-4 d-flex align-items-center">
        <div className="brand-logo me-2">
          <span className="logo-mark">BS</span>
        </div>
        <div>
          <div className="h5 mb-0 brand-name"><span className="brand-build">Build</span>Smart</div>
          <small className="text-muted">{prettyRole(role)}</small>
        </div>
      </div>

      <Nav className="flex-column" variant="pills">
        {visibleItems.map(item => (
          <Nav.Item key={item.key}>
            <NavLink to={item.to} className={({isActive}) => isActive ? 'nav-link active text-white' : 'nav-link text-white'}>
              {item.icon} {item.label}
            </NavLink>
          </Nav.Item>
        ))}
      </Nav>

      <div className="mt-auto small text-muted">© {new Date().getFullYear()} BuildSmart</div>
    </aside>
  );
};

export default Sidebar;

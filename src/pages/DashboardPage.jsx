import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import DashboardCard from '../components/dashboard/DashboardCard';
import API from '../api/axiosInstance';

const ROLE_DESCRIPTIONS = {
  ADMIN: 'Full system access. Manage users, view audit logs, and oversee all operations.',
  PROJECT_MANAGER: 'Manage construction projects, assign tasks, and track progress.',
  SITE_ENGINEER: 'Oversee on-site operations, report progress, and manage safety compliance.',
  SAFETY_OFFICER: 'Monitor safety protocols, conduct inspections, and manage incident reports.',
  VENDOR: 'Manage supply chain, submit invoices, and track deliveries.',
  FINANCE_OFFICER: 'Manage budgets, process payments, and generate financial reports.',
};

const DashboardPage = () => {
  const { user, hasRole, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (hasRole('ADMIN')) {
      fetchPendingCount();
    }
  }, [hasRole]);

  const fetchPendingCount = async () => {
    try {
      const response = await API.get('/admin/pending-users');
      const data = response.data.data || response.data || [];
      setPendingCount(Array.isArray(data) ? data.length : 0);
    } catch {
      // silently fail
    }
  };

  return (
    <DashboardLayout title="Dashboard" onLogout={logout}>
      {/* Welcome / breadcrumb */}
      <Row className="mb-2">
        <Col>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-transparent p-0 mb-1">
              <li className="breadcrumb-item active" aria-current="page">Home</li>
            </ol>
          </nav>
          <h2 className="mb-1">Welcome back, {user?.name}!</h2>
          <p className="text-muted mb-2">{ROLE_DESCRIPTIONS[user?.role] || 'Welcome to BuildSmart.'}</p>
        </Col>
      </Row>

      {/* Stats */}
      <Row className="g-2 mb-3">
        <Col md={6} lg={3}>
          <Card className="stat-card shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 display-6 text-muted">👥</div>
              <div>
                <div className="text-muted small">Pending Approvals</div>
                <div className="h5 mb-0">{pendingCount}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="stat-card shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 display-6 text-muted">🔑</div>
              <div>
                <div className="text-muted small">Your Role</div>
                <div className="h5 mb-0">{user?.role?.replace(/_/g, ' ')}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="stat-card shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 display-6 text-muted">🆔</div>
              <div>
                <div className="text-muted small">User ID</div>
                <div className="h5 mb-0">{user?.userId}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="stat-card shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 display-6 text-muted">📈</div>
              <div>
                <div className="text-muted small">Site Visits</div>
                <div className="h5 mb-0">8.2k</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>Quick Info</Card.Header>
            <Card.Body>
              <Table bordered striped responsive className="mb-0">
                <tbody>
                  <tr>
                    <th className="w-50">Email</th>
                    <td>{user?.email}</td>
                  </tr>
                  <tr>
                    <th>Role</th>
                    <td><Badge bg="primary">{user?.role?.replace(/_/g, ' ')}</Badge></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>Recent Activity</Card.Header>
            <Card.Body>
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Activity</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>10:42</td>
                    <td>Approved permit #123</td>
                    <td>jamie</td>
                  </tr>
                  <tr>
                    <td>09:30</td>
                    <td>New user sign up</td>
                    <td>linda</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
};

export default DashboardPage;

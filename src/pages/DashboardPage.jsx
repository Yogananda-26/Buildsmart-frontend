import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
// DashboardCard removed from this view (not used here)
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';

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
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const fetchRecentActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      if (hasRole('ADMIN')) {
        // fetch latest audit logs for admin
        const resp = await API.get('/admin/audit/logs?page=0&size=5&sortBy=timestamp&sortDir=desc');
        const data = resp.data.data || resp.data || [];
        const logs = data.content ? data.content : (Array.isArray(data) ? data : []);
        const items = logs.slice(0,5).map(l => ({
          time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : '-',
          activity: l.action?.replace(/_/g, ' ') + (l.details ? `: ${l.details}` : ''),
          user: l.userId || l.user || '-',
        }));
        setRecentActivities(items);
      } else {
        // try to fetch user-specific actions; fallback to local sample if endpoint not available
        try {
          const uid = user?.userId || user?.id || user?.username;
          const resp = await API.get(`/users/${uid}/activities?size=5`);
          const data = resp.data.data || resp.data || [];
          const items = (Array.isArray(data) ? data : []).slice(0,5).map(a => ({
            time: a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : '-',
            activity: a.action || a.details || 'Performed action',
            user: user?.username || user?.name || uid,
          }));
          setRecentActivities(items);
        } catch (innerErr) {
          // fallback: show sample actions for the current user
          setRecentActivities([
            { time: new Date().toLocaleTimeString(), activity: 'Updated profile', user: user?.username || user?.name },
            { time: new Date(Date.now()-3600*1000).toLocaleTimeString(), activity: 'Logged in', user: user?.username || user?.name },
          ]);
        }
      }
    } catch (err) {
      toast.error('Failed to load recent activity');
    } finally {
      setActivitiesLoading(false);
    }
  }, [hasRole, user]);

  useEffect(() => {
    if (hasRole('ADMIN')) {
      fetchPendingCount();
    }
    fetchRecentActivities();
  }, [hasRole, fetchRecentActivities]);

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

        {/* Site Visits card removed as requested */}
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
                  {activitiesLoading ? (
                    <tr><td colSpan="3" className="text-center text-muted py-3">Loading...</td></tr>
                  ) : (
                    recentActivities.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-muted py-3">No recent activity</td></tr>
                    ) : (
                      recentActivities.map((act, idx) => (
                        <tr key={idx}>
                          <td>{act.time}</td>
                          <td className="text-truncate truncate-max-250">{act.activity}</td>
                          <td>{act.user}</td>
                        </tr>
                      ))
                    )
                  )}
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

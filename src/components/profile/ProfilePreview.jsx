import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const prettyRole = (r) => {
  if (!r) return 'Guest';
  return r
    .toLowerCase()
    .split(/_|\s+/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};

const ProfilePreview = ({ user }) => {
  if (!user) {
    return (
      <Card body style={{ minWidth: 220 }}>
        <div className="text-center">No user</div>
      </Card>
    );
  }

  return (
    <Card style={{ minWidth: 260 }}>
      <Card.Body>
        <Row className="align-items-center">
          <Col xs={3} className="text-center">
            <div style={{ width: 48, height: 48, borderRadius: 8, background: '#e9eefc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          </Col>
          <Col xs={9}>
            <div className="fw-bold">{user.name}</div>
            <div className="text-muted small">{prettyRole(user.role)}</div>
            <div className="text-muted small">{user.email}</div>
            <div className="mt-2">
              <Button as={Link} to="/profile" variant="outline-primary" size="sm" className="w-100">View Profile</Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProfilePreview;

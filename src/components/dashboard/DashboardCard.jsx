import React from 'react';
import { Card } from 'react-bootstrap';

const DashboardCard = ({ title, value, icon, color = '#1a365d' }) => {
  return (
    <Card className="shadow-sm h-100 border-0">
      <Card.Body className="d-flex align-items-center">
        <div className="card-icon me-3" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <h6 className="text-muted mb-1">{title}</h6>
          <h4 className="mb-0 fw-bold">{value}</h4>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DashboardCard;

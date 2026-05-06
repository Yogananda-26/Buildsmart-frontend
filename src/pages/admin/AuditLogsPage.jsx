import React from 'react';
import { Container, Card, Stack, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiActivity, FiDownload, FiRefreshCw, FiChevronRight } from 'react-icons/fi';
import AuditLogTable from '../../components/admin/AuditLogTable';

const AuditLogsPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Container fluid className="px-lg-5 py-4">
        
        {/* Breadcrumb Navigation */}
        <Stack direction="horizontal" gap={2} className="mb-2 text-muted small">
          <span>Admin</span>
          <FiChevronRight size={12} />
          <span className="text-dark fw-medium">Security & Audit</span>
        </Stack>

        {/* Professional Header Action Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.03em' }}>
              System Audit Logs
            </h3>
            <p className="text-muted mb-0 small">
              Monitor real-time system activities, security events, and administrative changes.
            </p>
          </div>

          <Stack direction="horizontal" gap={2} className="mt-3 mt-md-0">
            <Button 
              variant="link" 
              className="text-decoration-none text-secondary d-flex align-items-center gap-2 px-3 py-2 border rounded-3 bg-white shadow-sm"
              style={{ fontSize: '0.85rem' }}
              onClick={() => window.location.reload()}
            >
              <FiRefreshCw size={16} />
              <span>Refresh Feed</span>
            </Button>
            
            <Button 
              className="d-flex align-items-center gap-2 px-4 py-2 border-0 shadow-sm"
              style={{ 
                background: '#F06222', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                fontWeight: 600 
              }}
            >
              <FiDownload size={18} />
              <span>Download Logs</span>
            </Button>
          </Stack>
        </div>

        {/* Main Interface Card */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Card.Header className="bg-white border-0 py-3 px-4 pt-4">
            <div className="d-flex align-items-center gap-2">
              <FiActivity className="text-primary" />
              <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.05em' }}>
                Event History
              </span>
            </div>
          </Card.Header>

          <Card.Body className="p-0">
            <AuditLogTable />
          </Card.Body>

          <Card.Footer className="bg-white border-top py-3 px-4 text-center">
            <small className="text-muted">
              Audit logs are immutable and stored for <strong>90 days</strong> for compliance purposes.
            </small>
          </Card.Footer>
        </Card>

      </Container>
    </motion.div>
  );
};

export default AuditLogsPage;
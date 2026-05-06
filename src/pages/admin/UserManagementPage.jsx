import React from 'react';
import { Container, Card, Button, Stack, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUserPlus, FiLayers, FiDownload, FiChevronRight } from 'react-icons/fi';
import UserTable from '../../components/admin/UserTable';

const UserManagementPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Container fluid className="px-lg-5 py-4">
        
       
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.03em' }}>
              Personnel Directory
            </h3>
            <p className="text-muted mb-0 small">
              Manage system access levels, account security, and organizational roles.
            </p>
          </div>

        </div>

        {/* Main Interface Card */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Card.Header className="bg-white border-0 py-3 px-4 pt-4">
            <div className="d-flex align-items-center gap-2">
              <FiLayers className="text-primary" />
              <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.05em' }}>
                System Access Records
              </span>
            </div>
          </Card.Header>

          <Card.Body className="p-0">
            <UserTable />
          </Card.Body>

        </Card>
      </Container>
    </motion.div>
  );
};

export default UserManagementPage;
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/profile/ProfileView';

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-3">
        <Button variant="link" className="me-2 p-0" onClick={() => navigate(-1)}>&larr; Back</Button>
        <h4 className="fw-bold mb-0 heading-primary">Profile</h4>
      </div>
      <ProfileView />
    </Container>
  );
};

export default ProfilePage;

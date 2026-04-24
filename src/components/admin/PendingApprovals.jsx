import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../../api/axiosInstance';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';

const ROLE_COLORS = {
  ADMIN: 'danger',
  PROJECT_MANAGER: 'primary',
  SITE_ENGINEER: 'success',
  SAFETY_OFFICER: 'warning',
  VENDOR: 'info',
  FINANCE_OFFICER: 'secondary',
};

const formatRole = (role) => role ? role.replace(/_/g, ' ') : '';

const PendingApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'
  const [selectedUser, setSelectedUser] = useState(null);
  const [processingUserId, setProcessingUserId] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await API.get('/admin/pending-users');
      setUsers(response.data.data || response.data || []);
    } catch (err) {
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedUser || !modalAction) return;
    try {
      setProcessingUserId(selectedUser.userId);
      // Backend expects these endpoint names (approve-user / reject-user)
      const endpoint = modalAction === 'approve'
        ? `/admin/approve-user/${selectedUser.userId}`
        : `/admin/reject-user/${selectedUser.userId}`;
      // Debug log: show what we're about to send to the backend
      try {
        console.debug('PendingApprovals -> calling endpoint', {
          method: 'POST',
          url: `${API.defaults.baseURL}${endpoint}`,
          token: localStorage.getItem('token') || null,
          userId: selectedUser.userId,
          action: modalAction,
        });
      } catch (logErr) {
        // ignore logging errors
      }

      // send an empty JSON body in case backend expects a JSON payload
      const resp = await API.post(endpoint, {});
      console.debug('PendingApprovals -> server response', resp && (resp.data || resp));
      toast.success(`User ${modalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
      setUsers(users.filter(u => u.userId !== selectedUser.userId));
    } catch (err) {
      console.error('Pending approval action error:', err);
      // Print response payload (if available) for debugging
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        console.error('Response data:', err.response.data);
      }
      // Provide clearer toast message with possible server hint
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      if (status === 500) {
        toast.error(`Server error (500): ${serverMsg || 'Check server logs for stack trace.'}`);
      } else if (status) {
        toast.error(`Request failed (${status}): ${serverMsg}`);
      } else {
        toast.error(`Request failed: ${serverMsg}`);
      }
    } finally {
      setShowModal(false);
      setSelectedUser(null);
      setModalAction(null);
      setProcessingUserId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading pending approvals..." />;

  return (
    <>
      {users.length === 0 ? (
        <Alert variant="info">No pending approvals at this time.</Alert>
      ) : (
        <Table responsive hover className="align-middle">
          <thead className="table-header">
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Requested Role</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td><code>{user.userId}</code></td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td><Badge bg={ROLE_COLORS[user.role]}>{formatRole(user.role)}</Badge></td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-1"
                    onClick={() => openModal(user, 'approve')}
                    disabled={processingUserId === user.userId}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openModal(user, 'reject')}
                    disabled={processingUserId === user.userId}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelectedUser(null); }}
        onConfirm={handleConfirm}
        title={modalAction === 'approve' ? 'Approve User' : 'Reject User'}
        message={`Are you sure you want to ${modalAction} user "${selectedUser?.name}" (${selectedUser?.email})?`}
        confirmText={modalAction === 'approve' ? 'Approve' : 'Reject'}
        variant={modalAction === 'approve' ? 'success' : 'danger'}
        confirmLoading={!!processingUserId}
        confirmDisabled={!!processingUserId}
      />
    </>
  );
};

export default PendingApprovals;

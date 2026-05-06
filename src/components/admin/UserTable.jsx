import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiSearch, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import API from '../../api/axiosInstance';
import ConfirmModal from '../common/ConfirmModal';
import UserEditModal from './UserEditModal';

const ROLE_COLORS = {
  ADMIN: '#F06222',
  PROJECT_MANAGER: '#3B82F6',
  SITE_ENGINEER: '#22C55E',
  SAFETY_OFFICER: '#F59E0B',
  VENDOR: '#A855F7',
  FINANCE_OFFICER: '#14B8A6'
};

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!Array.isArray(users)) return;
    
    let filtered = users.filter(u => {
      const matchesSearch = !searchTerm || 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.userId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !roleFilter || u.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users');
      // Mapping to response.data.data based on your provided JSON
      const data = response.data.data || [];
      setUsers(data);
    } catch (err) {
      console.error("API Error:", err);
      toast.error('Connection failed: Could not load user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/admin/users/${userToDelete.userId}`);
      toast.success('Access revoked successfully');
      setUsers(users.filter(u => u.userId !== userToDelete.userId));
    } catch (err) {
      toast.error('Action failed: Record is protected or server error');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleEditSave = async (updatedData) => {
    try {
      const response = await API.put(`/admin/users/${userToEdit.userId}`, updatedData);
      const updated = response.data.data || response.data;
      setUsers(users.map(u => u.userId === userToEdit.userId ? updated : u));
      toast.success('Permissions updated');
      setShowEditModal(false);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" size="sm" className="me-2" />
      <span className="text-muted small fw-bold">Synchronizing Personnel Records...</span>
    </div>
  );

  return (
    <>
      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-light border-bottom d-flex flex-wrap gap-3">
        <InputGroup className="shadow-sm" style={{ maxWidth: '350px' }}>
          <InputGroup.Text className="bg-white border-end-0 text-muted">
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            className="border-start-0 ps-0"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Form.Select 
          className="shadow-sm border-0" 
          style={{ maxWidth: '200px', fontSize: '0.9rem' }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Search By Role</option>
          {Object.keys(ROLE_COLORS).map(r => (
            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
          ))}
        </Form.Select>
      </div>

      <Table responsive hover className="mb-0">
        <thead className="bg-light">
          <tr style={{ fontSize: '0.75rem', color: '#64748B' }}>
            <th className="ps-4 border-0">USER ID</th>
            <th className="border-0">PERSONNEL DETAILS</th>
            <th className="border-0">CONTACT</th>
            <th className="border-0">ROLE</th>
            <th className="border-0 text-center">SYSTEM STATUS</th>
            <th className="border-0 text-end pe-4">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr><td colSpan="6" className="text-center py-5 text-muted">No matching personnel found in database</td></tr>
          ) : (
            filteredUsers.map((user) => (
              <tr key={user.userId} className="align-middle">
                <td className="ps-4 font-monospace small">{user.userId}</td>
                <td>
                  <div className="fw-bold text-dark">{user.name}</div>
                  <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{user.email}</div>
                </td>
                <td className="small">{user.phone}</td>
                <td>
                  <span className="badge rounded-pill" style={{ 
                    background: ROLE_COLORS[user.role] + '15', color: ROLE_COLORS[user.role],
                    border: `1px solid ${ROLE_COLORS[user.role]}30`, fontSize: '0.65rem'
                  }}>
                    {user.role?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="text-center">
                  <div style={{
                    background: '#22C55E15', color: '#22C55E', border: '1px solid #22C55E30',
                    padding: '4px 12px', borderRadius: '50px', fontSize: '0.65rem',
                    fontWeight: '700', display: 'inline-flex'
                  }}>{user.status || 'ACTIVE'}</div>
                </td>
                <td className="text-end pe-4">
                  <Button variant="link" className="text-primary p-1 me-2" onClick={() => { setUserToEdit(user); setShowEditModal(true); }}>
                    <FiEdit2 size={16} />
                  </Button>
                  <Button variant="link" className="text-danger p-1" onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}>
                    <FiTrash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Revoke Access"
        message={`Are you sure you want to permanently delete user "${userToDelete?.name}"?`}
        confirmText="Revoke Access"
        variant="danger"
      />

      <UserEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        user={userToEdit}
        onSave={handleEditSave}
      />
    </>
  );
};

export default UserTable;
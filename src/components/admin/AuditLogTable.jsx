import React, { useState, useEffect, useMemo } from 'react';
import { Table, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiFilter, FiXCircle } from 'react-icons/fi';
import API from '../../api/axiosInstance';
import { useAuth } from '../../../src/context/AuthContext';

const ACTION_COLORS = {
  LOGIN: '#3B82F6',
  LOGIN_SUCCESS: '#22C55E',
  LOGOUT: '#64748B',
  SIGNUP: '#10B981',
  PASSWORD_CHANGE: '#F59E0B',
  PROFILE_UPDATE: '#06B6D4',
  USER_APPROVED: '#22C55E',
  USER_REJECTED: '#EF4444',
  USER_DELETED: '#EF4444',
  USERS_LIST_ACCESSED: '#F59E0B',
};

const AuditLogTable = () => {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [userDirectory, setUserDirectory] = useState({}); // Lookup table for names
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const pageSize = 20;

  useEffect(() => {
    // Fetch both logs and the user directory for name mapping
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchUsersLookup(), fetchLogsPage(0)]);
      setLoading(false);
    };
    initializeData();
  }, []);

  // Fetch all users once to create a ID -> Name map
  const fetchUsersLookup = async () => {
    try {
      const response = await API.get('/admin/users');
      const userData = response.data.data || response.data || [];
      const lookup = {};
      userData.forEach(u => {
        lookup[u.userId] = u.name;
      });
      setUserDirectory(lookup);
    } catch (err) {
      console.error("Could not load user names for mapping", err);
    }
  };

  const fetchLogsPage = async (pageParam = 0) => {
    try {
      let url = `/admin/audit/logs?page=${pageParam}&size=${pageSize}&sortBy=timestamp&sortDir=desc`;
      const response = await API.get(url);
      const data = response.data.data || response.data;

      if (data && data.content) {
        setLogs(data.content);
        setTotalPages(data.totalPages || 1);
        setPage(pageParam);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    }
  };

  const applyFilters = async () => {
    const action = (actionFilter || '').trim();
    const uid = (userIdFilter || '').trim();
    if (!action && !uid) { fetchLogsPage(0); return; }

    setLoading(true);
    try {
      let url = `/admin/audit/logs?page=0&size=${pageSize}&sortBy=timestamp&sortDir=desc`;
      if (action) url += `&action=${encodeURIComponent(action)}`;
      if (uid) url += `&userId=${encodeURIComponent(uid)}`;

      const response = await API.get(url);
      const data = response.data.data || response.data;
      
      if (data && data.content) {
        setLogs(data.content);
        setTotalPages(data.totalPages || 1);
        setPage(0);
      }
    } catch (err) {
      toast.error('Filtering failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper to resolve the name using the lookup table
  const resolveName = (logUserId) => {
    // 1. Check the fetched user directory map
    if (userDirectory[logUserId]) return userDirectory[logUserId];
    
    // 2. Check if it's the current admin
    if (currentUser && logUserId === currentUser.userId) return currentUser.name;

    // 3. Last resort fallback
    return "Unknown User";
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" size="sm" className="me-2" />
      <span className="text-muted small fw-bold">Parsing Audit Trail...</span>
    </div>
  );

  return (
    <>
      <div className="p-4 bg-light border-bottom d-flex flex-wrap gap-3">
        <div style={{ minWidth: '250px' }}>
          <Form.Select 
            className="shadow-sm border-0" 
            style={{ fontSize: '0.9rem' }}
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">Filter by Action</option>
            {Object.keys(ACTION_COLORS).map(a => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </Form.Select>
        </div>

        <div style={{ minWidth: '250px' }}>
          <Form.Control
            className="shadow-sm border-0"
            style={{ fontSize: '0.9rem' }}
            placeholder="Filter by User ID"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
          />
        </div>

        <Button variant="primary" className="px-4 border-0 shadow-sm" onClick={applyFilters} style={{ background: '#3B82F6' }}>
          <FiFilter className="me-2" /> Apply
        </Button>
        <Button variant="outline-secondary" className="px-3 border-0 bg-white" onClick={() => { setActionFilter(''); setUserIdFilter(''); fetchLogsPage(0); }}>
          <FiXCircle className="me-2" /> Clear
        </Button>
      </div>

      <Table responsive hover className="mb-0 align-middle">
        <thead className="bg-light">
          <tr style={{ fontSize: '0.75rem', color: '#64748B' }}>
            <th className="ps-4 border-0">ID</th>
            <th className="border-0">NAME</th>
            <th className="border-0">ACTION</th>
            <th className="border-0">DETAILS</th>
            <th className="border-0">IP ADDRESS</th>
            <th className="border-0 text-end pe-4">TIMESTAMP</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="6" className="text-center py-5 text-muted">No security events found</td></tr>
          ) : (
            logs.map((log) => (
              <tr key={log.auditId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td className="ps-4 font-monospace small" style={{ color: '#F06222' }}>
                  <code>{log.userId}</code>
                </td>
                <td className="small fw-bold text-dark">
                  {resolveName(log.userId)}
                </td>
                <td>
                  <span className="badge rounded-pill" style={{ 
                    background: (ACTION_COLORS[log.action] || '#64748B') + '15', 
                    color: ACTION_COLORS[log.action] || '#64748B',
                    border: `1px solid ${ACTION_COLORS[log.action] || '#64748B'}30`, 
                    fontSize: '0.65rem'
                  }}>
                    {log.action?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="small text-muted" style={{ maxWidth: '250px' }}>
                  <div className="text-truncate">{log.details}</div>
                </td>
                <td className="small font-monospace text-muted">{log.ipAddress}</td>
                <td className="text-end pe-4 small text-muted">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div className="bg-light border-top p-3 d-flex justify-content-center align-items-center gap-3">
          <Button variant="outline-secondary" size="sm" className="bg-white border-0 shadow-sm" disabled={page === 0} onClick={() => fetchLogsPage(page - 1)}>
            Previous
          </Button>
          <span className="small text-muted fw-bold">Page {page + 1} of {totalPages}</span>
          <Button variant="outline-secondary" size="sm" className="bg-white border-0 shadow-sm" disabled={page >= totalPages - 1} onClick={() => fetchLogsPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </>
  );
};

export default AuditLogTable;
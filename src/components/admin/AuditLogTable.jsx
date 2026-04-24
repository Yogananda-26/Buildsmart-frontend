import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../../api/axiosInstance';
import LoadingSpinner from '../common/LoadingSpinner';

const ACTION_COLORS = {
  LOGIN: 'primary',
  LOGIN_SUCCESS: 'primary',
  LOGOUT: 'secondary',
  SIGNUP: 'success',
  PASSWORD_CHANGE: 'warning',
  PROFILE_UPDATE: 'info',
  USER_APPROVED: 'success',
  USER_REJECTED: 'danger',
  USER_DELETED: 'danger',
  USERS_LIST_ACCESSED: 'warning',
};

const AuditLogTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogsPage = async (pageParam = 0) => {
    setLoading(true);
    try {
      let url = `/admin/audit/logs?page=${pageParam}&size=${pageSize}&sortBy=timestamp&sortDir=desc`;
      const response = await API.get(url);
      const data = response.data.data || response.data;

      if (data && data.content) {
        console.debug('[AuditLogTable] fetchLogsPage paginated content length=', data.content.length);
        setLogs(data.content);
        setTotalPages(data.totalPages || 1);
        setPage(pageParam);
      } else if (Array.isArray(data)) {
        console.debug('[AuditLogTable] fetchLogsPage array length=', data.length);
        // client-side paginate
        const total = Math.max(1, Math.ceil(data.length / pageSize));
        const start = pageParam * pageSize;
        setLogs(data.slice(start, start + pageSize));
        setTotalPages(total);
        setPage(pageParam);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/admin/audit/logs?page=${page}&size=${pageSize}&sortBy=timestamp&sortDir=desc`;
      const response = await API.get(url);
      const data = response.data.data || response.data;

      if (data && data.content) {
        // Paginated response
        console.debug('[AuditLogTable] fetchLogs paginated content length=', data.content.length);
        setLogs(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        console.debug('[AuditLogTable] fetchLogs array length=', data.length);
        setLogs(data);
        setTotalPages(1);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterByAction = async (actionParam, pageParam = page) => {
    const action = (actionParam || actionFilter || '').trim();
    if (!action) { fetchLogsPage(pageParam); return; }
    setLoading(true);
    console.debug('[AuditLogTable] filterByAction called with action=', action, 'page=', pageParam);
    try {
      // If user filter is also set, prefer the combined endpoint shape
      const uid = (userIdFilter || '').trim();
      if (uid) {
        try {
          const combinedResp = await API.get(`/admin/audit/logs/user/${encodeURIComponent(uid)}/action/${encodeURIComponent(action)}?page=${pageParam}&size=${pageSize}`);
          const combinedData = combinedResp.data.data || combinedResp.data || [];
          if (combinedData && combinedData.content) {
            console.debug('[AuditLogTable] combined endpoint paginated length=', combinedData.content.length);
            setLogs(combinedData.content);
            setTotalPages(combinedData.totalPages || 1);
            setPage(pageParam);
          } else if (Array.isArray(combinedData)) {
            console.debug('[AuditLogTable] combined endpoint array length=', combinedData.length);
            // client-side paginate
            const total = Math.max(1, Math.ceil(combinedData.length / pageSize));
            const start = pageParam * pageSize;
            setLogs(combinedData.slice(start, start + pageSize));
            setTotalPages(total);
            setPage(pageParam);
          } else {
            console.debug('[AuditLogTable] combined endpoint returned empty/unknown shape', combinedData);
            setLogs([]);
            setTotalPages(1);
            setPage(pageParam);
          }
          setLoading(false);
          return;
        } catch (combErr) {
          console.warn('Combined user+action endpoint failed, falling back to other shapes', combErr);
          // continue to try other endpoints below
        }
      }
      // Use the paginated logs endpoint and pass action + page as query parameter
      let response;
      try {
        response = await API.get(`/admin/audit/logs?page=${pageParam}&size=${pageSize}&sortBy=timestamp&sortDir=desc&action=${encodeURIComponent(action)}`);
      } catch (err) {
        // try alternative endpoint shapes if the first fails
        console.warn('Primary action filter endpoint failed, trying alternative shapes', err);
        try {
          response = await API.get(`/admin/audit/logs/action/${encodeURIComponent(action)}?page=${pageParam}&size=${pageSize}`);
        } catch (err2) {
          try {
            response = await API.get(`/admin/audit/action/${encodeURIComponent(action)}?page=${pageParam}&size=${pageSize}`);
          } catch (err3) {
            throw err3;
          }
        }
      }

      const data = response.data.data || response.data || [];
      // The endpoint may return a paginated object with `content` or an array
      if (data && data.content) {
        console.debug('[AuditLogTable] action filter paginated length=', data.content.length);
        setLogs(data.content);
        setTotalPages(data.totalPages || 1);
        setPage(pageParam);
      } else if (Array.isArray(data)) {
        console.debug('[AuditLogTable] action filter array length=', data.length);
        const total = Math.max(1, Math.ceil(data.length / pageSize));
        const start = pageParam * pageSize;
        setLogs(data.slice(start, start + pageSize));
        setTotalPages(total);
        setPage(pageParam);
      } else {
        console.debug('[AuditLogTable] action filter returned empty/unknown shape', data);
        setLogs([]);
        setTotalPages(1);
        setPage(pageParam);
      }
    } catch (err) {
      console.error('Filter by action error', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data || err.message;
      toast.error(`Failed to filter by action${status ? ` (${status})` : ''}: ${JSON.stringify(serverMsg)}`);
    } finally {
      setLoading(false);
    }
  };

  const filterByUser = async (userParam, pageParam = page) => {
    const uid = (userParam || userIdFilter || '').trim();
    if (!uid) { fetchLogs(); return; }
    setLoading(true);
    console.debug('[AuditLogTable] filterByUser called with userIdFilter=', uid, 'page=', pageParam);
    try {
      let response;
      // Try a few endpoint shapes used by different backends
      // Prefer the simple user-by-id endpoint if the backend supports it
      try {
        const urlPrimary = `/admin/audit/logs/user/${encodeURIComponent(uid)}`;
        console.debug('[AuditLogTable] Trying primary user-by-id URL', urlPrimary);
        response = await API.get(urlPrimary);
      } catch (errPrimary) {
        console.warn('Primary user-by-id endpoint failed, trying query and alternative shapes', errPrimary);
        try {
          const url = `/admin/audit/logs?userId=${encodeURIComponent(uid)}&page=0&size=${pageSize}`;
          console.debug('[AuditLogTable] Trying fallback URL', url);
          response = await API.get(url);
        } catch (err) {
          try {
            const url3 = `/admin/audit/user/${encodeURIComponent(uid)}`;
            console.debug('[AuditLogTable] Trying alternative URL', url3);
            response = await API.get(url3);
          } catch (err3) {
            throw err3;
          }
        }
      }

      console.debug('[AuditLogTable] user filter response status=', response.status);
      const data = response.data.data || response.data || [];
      if (data && data.content) {
        console.debug('[AuditLogTable] user filter paginated length=', data.content.length);
        setLogs(data.content);
        setTotalPages(data.totalPages || 1);
        setPage(pageParam);
      } else if (Array.isArray(data)) {
        console.debug('[AuditLogTable] user filter array length=', data.length);
        // server returned full array; do client-side pagination
        const total = Math.max(1, Math.ceil(data.length / pageSize));
        const start = pageParam * pageSize;
        setLogs(data.slice(start, start + pageSize));
        setTotalPages(total);
        setPage(pageParam);
      } else {
        console.debug('[AuditLogTable] user filter returned empty/unknown shape', data);
        setLogs([]);
        setTotalPages(1);
        setPage(pageParam);
      }
    } catch (err) {
      console.error('Filter by user error', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data || err.message;
      toast.error(`Failed to filter by user${status ? ` (${status})` : ''}: ${JSON.stringify(serverMsg)}`);
    } finally {
      setLoading(false);
    }
  };


  const applyFilters = () => {
    const af = (actionFilter || '').trim();
    const uf = (userIdFilter || '').trim();
    console.debug('[AuditLogTable] applyFilters called', { actionFilter: af, userIdFilter: uf });
    // If no filters, reload default paginated logs
    if (!af && !uf) { fetchLogsPage(0); return; }
    // reset to first page when applying new filters
    const targetPage = 0;
    if (af) { setActionFilter(af); setPage(targetPage); filterByAction(af, targetPage); return; }
    // Otherwise filter by user only
    if (uf) { setUserIdFilter(uf); setPage(targetPage); filterByUser(uf, targetPage); return; }
  };

  const clearFilters = () => {
    setActionFilter('');
    setUserIdFilter('');
    setPage(0);
    fetchLogs();
  };

  if (loading) return <LoadingSpinner message="Loading audit logs..." />;

  const loadPage = (pageParam) => {
    const p = Math.max(0, pageParam);
    // Update local page state
    setPage(p);
    const af = (actionFilter || '').trim();
    const uf = (userIdFilter || '').trim();
    if (!af && !uf) {
      fetchLogsPage(p);
      return;
    }
    if (af) {
      filterByAction(af, p);
      return;
    }
    if (uf) {
      filterByUser(uf, p);
      return;
    }
  };

  return (
    <>
      {/* Filters */}
      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">Filter by Action</option>
            {Object.keys(ACTION_COLORS).map(a => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control
            placeholder="Filter by User ID"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Button variant="outline-primary" className="w-100" onClick={applyFilters}>Apply</Button>
        </Col>
        <Col md={2}>
          <Button variant="outline-secondary" className="w-100" onClick={clearFilters}>Clear</Button>
        </Col>
      </Row>

      <Table responsive hover size="sm" className="align-middle">
        <thead className="table-header">
          <tr>
            <th>Username</th>
            <th>Action</th>
            <th>Details</th>
            <th>IP Address</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="5" className="text-center text-muted py-4">No audit logs found</td></tr>
          ) : (
            logs.map((log) => (
              <tr key={log.auditId}>
                <td><code>{log.userId}</code></td>
                <td>
                  <Badge bg={ACTION_COLORS[log.action] || 'secondary'}>
                    {log.action?.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="text-truncate truncate-max-250">{log.details}</td>
                <td>{log.ipAddress}</td>
                <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Button variant="outline-primary" size="sm" disabled={page === 0} onClick={() => loadPage(page - 1)}>
            Previous
          </Button>
          <span className="align-self-center text-muted">Page {page + 1} of {totalPages}</span>
              <Button variant="outline-primary" size="sm" disabled={page >= totalPages - 1} onClick={() => loadPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </>
  );
};

export default AuditLogTable;

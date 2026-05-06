import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiUsers, FiUserCheck, FiUserX, FiUserMinus } from 'react-icons/fi'
import API from '../../../api/axiosInstance'
import useAsyncData from '../../../components/common/useAsyncData'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import KPICard from '../../../components/common/KPICard'
import DataTable from '../../../components/common/DataTable'
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Sector
} from 'recharts'

const ROLE_COLORS = { 
  ADMIN: '#F06222', 
  PROJECT_MANAGER: '#3B82F6', 
  SITE_ENGINEER: '#22C55E', 
  SAFETY_OFFICER: '#F59E0B', 
  VENDOR: '#A855F7', 
  FINANCE_OFFICER: '#14B8A6', 
  WORKER: '#64748B' 
}

// ── PieChart Hover Overlay Shape ─────────────────────────────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 10} // Significant grow effect on hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function UserAnalytics() {
  const [activePieIndex, setActivePieIndex] = useState(null);

  // 1. Initialize Hooks
  const analytics = useAsyncData(() => API.get('/api/reports/users/analytics'))
  const users = useAsyncData(() => API.get('/api/reports/users/all'))

  const a = analytics.data || {}
  const uList = users.data || a.users || []

  // 2. Data Processing (Memoized for Stability)
  const pieData = useMemo(() => 
    Object.entries(a.usersByRole || {}).map(([role, count]) => ({ 
      name: role.replace(/_/g, ' '), 
      value: count, 
      color: ROLE_COLORS[role] || '#94A3B8' 
    })), [a.usersByRole]);

  const statusBarData = useMemo(() => 
    Object.entries(a.statusByRole || {}).map(([role, statuses]) => ({ 
      role: role.replace(/_/g, ' '), 
      ACTIVE: statuses.ACTIVE || 0, 
      INACTIVE: statuses.INACTIVE || 0, 
      SUSPENDED: statuses.SUSPENDED || 0 
    })), [a.statusByRole]);

  // 3. Conditional Loading/Error States
  if (analytics.loading) return <LoadingSpinner message="Analyzing workforce data..." />
  if (analytics.error) return <ErrorMessage message={analytics.error} onRetry={analytics.reload} />

  // 4. Configuration for Directory Table
  const columns = [
    { key: 'userId', label: 'ID', sortable: true },
    { key: 'name', label: 'User Details', sortable: true, render: (v, row) => (
      <div className="d-flex align-items-center gap-3">
        <div className="avatar-circle" style={{ 
          background: (ROLE_COLORS[row.role] || '#64748B') + '15', 
          color: ROLE_COLORS[row.role] || '#64748B',
          width: 35, height: 35, borderRadius: '50%',
          display: 'grid', placeContent: 'center', fontWeight: 700, fontSize: '0.8rem'
        }}>{(v || 'U')[0].toUpperCase()}</div>
        <div>
          <div className="fw-bold text-dark mb-0 small">{v}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{row.email}</div>
        </div>
      </div>
    )},
    { key: 'role', label: 'Access Level', render: v => (
      <span className="badge rounded-pill" style={{ 
        background: (ROLE_COLORS[v] || '#64748B') + '15', color: ROLE_COLORS[v] || '#64748B',
        border: `1px solid ${ROLE_COLORS[v] || '#64748B'}30`, fontSize: '0.65rem'
      }}>{v?.replace(/_/g, ' ')}</span>
    )},
    { 
      key: 'status', 
      label: 'System Status', 
      render: v => {
        const status = v || 'ACTIVE';
        const statusColors = { ACTIVE: '#22C55E', INACTIVE: '#64748B', SUSPENDED: '#EF4444', PENDING: '#F59E0B' };
        const color = statusColors[status] || '#64748B';
        return (
          <div style={{
            background: color + '15', color: color, border: `1px solid ${color}30`,
            padding: '4px 12px', borderRadius: '50px', fontSize: '0.65rem',
            fontWeight: '700', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', textTransform: 'uppercase', minWidth: '80px'
          }}>{status}</div>
        );
      }
    },
  ]

  const kpiData = [
    { label: 'Total Users', val: a.totalUsers ?? uList.length, icon: FiUsers, col: '#6366F1', link: '/admin/users' },
    { label: 'Active', val: a.activeUsers ?? 0, icon: FiUserCheck, col: '#22C55E' },
    { label: 'Inactive', val: a.inactiveUsers ?? 0, icon: FiUserMinus, col: '#64748B' },
    { label: 'Suspended', val: a.suspendedUsers ?? 0, icon: FiUserX, col: '#EF4444' }
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container-fluid py-4">
      <div className="page-header mb-4">
        <h2 className="fw-bold">User Analytics</h2>
        <p className="text-muted small">Workforce breakdown and account monitoring</p>
      </div>

      {/* KPI Cards (With Fixed Labels and Navigation) */}
      <div className="row g-3 mb-4">
        {kpiData.map((k, i) => (
          <div key={i} className="col-6 col-md-3">
            {k.link ? (
              <Link to={k.link} style={{ textDecoration: 'none' }}>
                <KPICard label={k.label} value={k.val} icon={k.icon} color={k.col} />
              </Link>
            ) : (
              <KPICard label={k.label} value={k.val} icon={k.icon} color={k.col} />
            )}
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* PIE CHART with Permanent Animation & Mouse Overlay */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="fw-bold mb-0">Role Distribution</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie 
                    key={pieData.length} // Force re-render animation on data load
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={pieData} 
                    cx="50%" cy="50%" 
                    innerRadius={65} outerRadius={85} 
                    paddingAngle={5} 
                    dataKey="value"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                    isAnimationActive={true}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  >
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BAR CHART */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="fw-bold mb-0">Account Health by Role</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={statusBarData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="role" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 500 }} 
                    interval={0} 
                    angle={-15} 
                    textAnchor="end" 
                  />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '10px', border: 'none' }} />
                  <Bar dataKey="ACTIVE" fill="#22C55E" stackId="s" name="Active" />
                  <Bar dataKey="INACTIVE" fill="#94A3B8" stackId="s" name="Inactive" />
                  <Bar dataKey="SUSPENDED" fill="#EF4444" stackId="s" name="Suspended" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h6 className="fw-bold mb-0">User Directory</h6>
        </div>
        <div className="card-body p-0">
          <div className="px-3 pb-3">
            <DataTable columns={columns} data={uList} searchable pageSize={10} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
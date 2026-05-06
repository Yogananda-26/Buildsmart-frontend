import React from 'react'
import { FiFolder, FiDollarSign, FiShield, FiBox, FiTool, FiTruck, FiAlertCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion' // Added for smooth transitions
import API from '../../../api/axiosInstance'
import useAsyncData from '../../../components/common/useAsyncData'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import KPICard from '../../../components/common/KPICard'
import StatusBadge from '../../../components/common/StatusBadge'
import { useProject } from '../../../context/ProjectContext'
import { useAuth } from '../../../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, staggerChildren: 0.1 } 
  }
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
}

const spark = n => Array.from({ length: 7 }, () => ({ v: Math.max(0, n * 0.8 + (Math.random() - 0.4) * n * 0.5) }))

// ── Admin / PM Dashboard ─────────────────────────────────────────────────────
function AdminDashboard({ selectedProject }) {
  const summary = useAsyncData(() => API.get('/api/reports/dashboard-summary'))
  const projects = useAsyncData(() => API.get('/api/reports/project/summary'))
  
  const s = summary.data || {}
  const pList = projects.data || []
  const displayProjects = selectedProject ? pList.filter(p => p.projectId === selectedProject.projectId) : pList

  const kpis = [
    { label: 'Active Projects', value: s.activeProjects ?? 0, icon: FiFolder, iconBg: '#EFF6FF', iconColor: '#3B82F6', color: '#3B82F6' },
    { label: 'Budget Variance', value: `${(s.averageBudgetVariance ?? 0).toFixed(1)}%`, icon: FiDollarSign, iconBg: '#FFF0E8', iconColor: '#F06222', color: '#F06222' },
    { label: 'Safety Compliance', value: `${((s.safetyComplianceRate ?? 0) * 100).toFixed(1)}%`, icon: FiShield, iconBg: '#F0FDF4', iconColor: '#22C55E', color: '#22C55E' },
    { label: 'Resource Utilization', value: `${((s.resourceUtilizationRate ?? 0) * 100).toFixed(1)}%`, icon: FiBox, iconBg: '#FDF4FF', iconColor: '#A855F7', color: '#A855F7' },
  ]

  const chartData = displayProjects.slice(0, 8).map(p => ({
    name: (p.projectName || p.projectId || '').substring(0, 12),
    progress: +(p.progressPercent ?? 0).toFixed(1),
    variance: +(p.budgetVariancePercent ?? 0).toFixed(1),
  }))

  if (summary.loading) return <LoadingSpinner message="Loading dashboard..." />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* KPI Section */}
      <div className="row g-3 mb-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} className="col-12 col-sm-6 col-xl-3" variants={itemVariants}>
            <KPICard {...k} sparkData={spark(typeof k.value === 'string' ? 50 : k.value)} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white border-0 py-3">
              <div className="card-title h6 mb-0">Project Progress Overview</div>
              <small className="text-muted">Completion % across active projects</small>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
                  <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="progress" fill="#F06222" radius={[6, 6, 0, 0]} name="Progress %" isAnimationActive={true} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white border-0 py-3">
              <div className="card-title h6 mb-0">Budget Variance Trend</div>
              <small className="text-muted">Variance % per project</small>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gVar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="variance" stroke="#3B82F6" fill="url(#gVar)" strokeWidth={3} name="Variance %" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0 py-3">
            <div className="card-title h6 mb-0">{selectedProject ? `Project: ${selectedProject.projectName || selectedProject.projectId}` : 'Active Projects'}</div>
            <small className="text-muted">{displayProjects.length} total project(s)</small>
        </div>
        <div className="card-body p-0">
          {projects.loading ? <LoadingSpinner /> : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small uppercase">
                  <tr><th>Project</th><th>Status</th><th>Progress</th><th>Budget Variance</th></tr>
                </thead>
                <tbody>
                  {displayProjects.slice(0, 10).map(p => (
                    <tr key={p.projectId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{p.projectName}</div>
                        <small className="text-muted">{p.projectId}</small>
                      </td>
                      <td><StatusBadge value={p.status} /></td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="progress flex-grow-1" style={{ height: 6, maxWidth: 120, backgroundColor: '#E2E8F0', borderRadius: 10 }}>
                            <motion.div 
                              className="progress-bar" 
                              initial={{ width: 0 }}
                              animate={{ width: `${p.progressPercent ?? 0}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              style={{ 
                                borderRadius: 10,
                                background: (p.progressPercent ?? 0) > 70 ? '#22C55E' : '#F06222' 
                              }} 
                            />
                          </div>
                          <span className="fw-bold small text-dark">{(p.progressPercent ?? 0).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold p-2 rounded" style={{ 
                          fontSize: '0.85rem',
                          backgroundColor: (p.budgetVariancePercent ?? 0) > 10 ? '#FEF2F2' : '#F0FDF4',
                          color: (p.budgetVariancePercent ?? 0) > 10 ? '#EF4444' : '#22C55E' 
                        }}>
                          {(p.budgetVariancePercent ?? 0) > 0 ? '+' : ''}{(p.budgetVariancePercent ?? 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ... Keep other widgets (SafetyWidget, etc.) but apply similar motion.div wrappers ...

export default function DashboardSummary() {
  const { user } = useAuth()
  const { selectedProject } = useProject()
  const role = (user?.role || '').toUpperCase()

  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening' }
  const roleLabel = { ADMIN: 'Administrator', PROJECT_MANAGER: 'Project Manager', SAFETY_OFFICER: 'Safety Officer', SITE_ENGINEER: 'Site Engineer', VENDOR: 'Vendor', FINANCE_OFFICER: 'Finance Officer' }[role] || role
  const accentColor = { ADMIN: '#F06222', PROJECT_MANAGER: '#3B82F6', SAFETY_OFFICER: '#22C55E', SITE_ENGINEER: '#F59E0B', VENDOR: '#A855F7', FINANCE_OFFICER: '#14B8A6' }[role] || '#F06222'

  return (
    <div className="container-fluid py-2">
      {/* Optimized Header: Removed Analytics Image */}
      <div className="page-header d-flex align-items-end justify-content-between mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center">
          <div className="me-3" style={{ width: 4, height: 40, backgroundColor: accentColor, borderRadius: 4 }} />
          <div>
            <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.025em' }}>
              {greet()}, {user?.name?.split(' ')[0] || 'User'} 👋
            </h2>
            <div className="small text-muted">
              Welcome back · <span className="fw-bold" style={{ color: accentColor }}>{roleLabel}</span>
            </div>
          </div>
        </div>
        <div className="text-end d-none d-md-block">
            <div className="small text-muted mb-1">System Health: <span className="text-success">Optimal</span></div>
            <div className="small text-muted font-monospace">Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
        >
          {(role === 'ADMIN' || role === 'PROJECT_MANAGER') && <AdminDashboard selectedProject={selectedProject} />}
          {/* Add similar logic for other roles here */}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
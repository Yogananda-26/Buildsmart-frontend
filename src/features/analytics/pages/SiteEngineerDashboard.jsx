import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../../api/axiosInstance'
import useAsyncData from '../../../components/common/useAsyncData'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import KPICard from '../../../components/common/KPICard'
import StatusBadge from '../../../components/common/StatusBadge'
import DataTable from '../../../components/common/DataTable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useProject } from '../../../context/ProjectContext'

const TABS = ['Performance', 'Summary', 'Daily Logs']

export default function SiteEngineerDashboard() {
  const [tab, setTab] = useState('Performance')
  const performance = useAsyncData(() => API.get('/api/reports/site-engineer/performance'))
  const summary = useAsyncData(() => API.get('/api/reports/site-engineer/summary'))
  const logs = useAsyncData(() => API.get('/api/reports/site-engineer/daily-logs'))
  const { selectedProject } = useProject()
  const navigate = useNavigate()

  const eList = performance.data || []
  const sum = summary.data || {}
  const logList = logs.data || []

  const avgCompletion = eList.length ? eList.reduce((s, e) => s + (e.taskCompletionRate ?? 0), 0) / eList.length : 0
  const totalPending = eList.reduce((s, e) => s + (e.issuesPending ?? 0), 0)
  const totalResolved = eList.reduce((s, e) => s + (e.issuesResolved ?? 0), 0)

  const perfColumns = [
    { key: 'engineerId', label: 'ID', sortable: true },
    { key: 'engineerName', label: 'Engineer', sortable: true, render: (v, row) => (
      <button style={{ background: 'none', color: '#F06222', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate(`/analytics/site-engineers/${row.engineerId}`)}>{v}</button>
    )},
    { key: 'assignedProject', label: 'Project', render: v => <span style={{ fontSize: 13 }}>{v}</span> },
    { key: 'performanceGrade', label: 'Grade', render: v => <StatusBadge value={v} /> },
    { key: 'taskCompletionRate', label: 'Completion', sortable: true, render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="progress" style={{ width: 80 }}>
          <div className="progress-bar" style={{ width: `${v ?? 0}%`, background: (v ?? 0) >= 70 ? '#22C55E' : '#F59E0B' }} />
        </div>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{(v ?? 0).toFixed(1)}%</span>
      </div>
    )},
    { key: 'qualityScore', label: 'Quality', sortable: true, render: v => (v ?? 0).toFixed(1) },
    { key: 'issuesPending', label: 'Pending', sortable: true, render: v => <span style={{ color: v > 0 ? '#EF4444' : '#22C55E', fontWeight: 600 }}>{v}</span> },
    { key: 'issuesResolved', label: 'Resolved', sortable: true, render: v => <span style={{ color: '#22C55E', fontWeight: 600 }}>{v}</span> },
  ]

  const logColumns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'engineerName', label: 'Engineer', sortable: true },
    { key: 'projectName', label: 'Project', sortable: true },
    { key: 'hoursOnSite', label: 'Hours', sortable: true, render: v => `${(v ?? 0).toFixed(1)}h` },
    { key: 'tasksCompleted', label: 'Tasks', render: (v, row) => `${v}/${row.tasksAssigned}` },
    { key: 'issuesReported', label: 'Issues', sortable: true, render: v => <span style={{ color: v > 0 ? '#F59E0B' : '#22C55E', fontWeight: 600 }}>{v}</span> },
    { key: 'remarks', label: 'Remarks', render: v => <span style={{ fontSize: 12, color: '#64748B', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span> },
  ]

  if (performance.loading) return <LoadingSpinner message="Loading site engineer data..." />
  if (performance.error) return <ErrorMessage message={performance.error} onRetry={performance.reload} />

  return (
    <div>
      <div className="page-header">
        <h1>Site Engineer Analytics</h1>
        <p>Performance metrics, daily logs, and site progress tracking</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><KPICard title="Total Engineers" value={eList.length} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Avg Completion" value={`${avgCompletion.toFixed(1)}%`} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Issues Pending" value={totalPending} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Issues Resolved" value={totalResolved} /></div>
      </div>

      <ul className="nav nav-tabs mb-3">
        {TABS.map(t => (
          <li key={t} className="nav-item">
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          </li>
        ))}
      </ul>

      {tab === 'Performance' && (
        <div>
          <div className="row g-3" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Task Completion Rate</div></div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={eList.slice(0, 10).map(e => ({ name: (e.engineerName || e.engineerId || '').substring(0, 10), rate: +(e.taskCompletionRate ?? 0).toFixed(1) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                  <Bar dataKey="rate" fill="#F06222" radius={[4, 4, 0, 0]} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Issues Resolved vs Pending</div></div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={eList.slice(0, 8).map(e => ({ name: (e.engineerName || '').substring(0, 8), resolved: e.issuesResolved ?? 0, pending: e.issuesPending ?? 0 }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                  <Legend />
                  <Bar dataKey="resolved" fill="#22C55E" radius={[4, 4, 0, 0]} name="Resolved" />
                  <Bar dataKey="pending" fill="#EF4444" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Engineer Performance</div></div>
            <DataTable columns={perfColumns} data={eList} searchable pageSize={8} />
          </div>
        </div>
      )}

      {tab === 'Summary' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Site Progress Summary</div></div>
          {summary.loading ? <LoadingSpinner /> : (
            <div className="row g-3">
              {[{ label: 'Total Engineers', value: sum.totalSiteEngineers ?? eList.length }, { label: 'Active Sites', value: sum.activeSites ?? 0 }, { label: 'Avg Task Completion', value: `${(sum.avgTaskCompletionRate ?? avgCompletion).toFixed(1)}%` }, { label: 'Avg Quality Score', value: `${(sum.avgQualityScore ?? 0).toFixed(1)}` }, { label: 'Open Issues', value: sum.totalIssuesOpen ?? totalPending }, { label: 'Resolved Issues', value: sum.totalIssuesResolved ?? totalResolved }, { label: 'Inspections This Month', value: sum.inspectionsThisMonth ?? 0 }, { label: 'Efficiency Index', value: `${(sum.siteEfficiencyIndex ?? 0).toFixed(2)}` }].map(s => (
                <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: '#F06222' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Daily Logs' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Daily Activity Logs</div></div>
          {logs.loading ? <LoadingSpinner /> : <DataTable columns={logColumns} data={logList} searchable pageSize={10} />}
        </div>
      )}
    </div>
  )
}

import React from 'react'
import API from '../../../api/axiosInstance'
import useAsyncData from '../../../components/common/useAsyncData'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import KPICard from '../../../components/common/KPICard'
import StatusBadge from '../../../components/common/StatusBadge'
import DataTable from '../../../components/common/DataTable'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function ProjectHealth() {
  const projects = useAsyncData(() => API.get('/api/reports/project/summary'))

  if (projects.loading) return <LoadingSpinner message="Loading project data..." />
  if (projects.error) return <ErrorMessage message={projects.error} onRetry={projects.reload} />

  const pList = projects.data || []
  const onTrack = pList.filter(p => p.status === 'ON_TRACK').length
  const atRisk = pList.filter(p => p.status === 'AT_RISK').length
  const delayed = pList.filter(p => p.status === 'DELAYED').length
  const avgProgress = pList.length ? pList.reduce((s, p) => s + (p.progressPercent ?? 0), 0) / pList.length : 0

  const columns = [
    { key: 'projectId', label: 'ID', sortable: true },
    { key: 'projectName', label: 'Project Name', sortable: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: '#1E293B' }}>{v}</div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>{row.projectId}</div>
      </div>
    )},
    { key: 'status', label: 'Status', render: v => <StatusBadge value={v} /> },
    { key: 'progressPercent', label: 'Progress', sortable: true, render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="progress" style={{ width: 90 }}>
          <div className="progress-bar" style={{ width: `${v ?? 0}%`, background: (v ?? 0) >= 70 ? '#22C55E' : '#F06222' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 40 }}>{(v ?? 0).toFixed(1)}%</span>
      </div>
    )},
    { key: 'budgetVariancePercent', label: 'Budget Variance', sortable: true, render: v => (
      <span style={{ fontWeight: 700, color: Math.abs(v ?? 0) > 10 ? '#EF4444' : '#22C55E' }}>{(v ?? 0) > 0 ? '+' : ''}{(v ?? 0).toFixed(1)}%</span>
    )},
  ]

  const radarData = [
    { metric: 'Progress', value: avgProgress },
    { metric: 'On Track', value: pList.length ? (onTrack / pList.length) * 100 : 0 },
    { metric: 'Budget Health', value: 100 - Math.min(100, pList.reduce((s, p) => s + Math.abs(p.budgetVariancePercent ?? 0), 0) / Math.max(pList.length, 1) * 5) },
    { metric: 'Completion Rate', value: pList.filter(p => (p.progressPercent ?? 0) >= 90).length / Math.max(pList.length, 1) * 100 },
    { metric: 'Risk Score', value: 100 - (atRisk + delayed) / Math.max(pList.length, 1) * 100 },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Project Health Dashboard</h1>
        <p>Schedule variance, cost performance, and project status across all projects</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><KPICard title="Total Projects" value={pList.length} /></div>
        <div className="col-6 col-lg-3"><KPICard title="On Track" value={onTrack} /></div>
        <div className="col-6 col-lg-3"><KPICard title="At Risk" value={atRisk} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Avg Progress" value={`${avgProgress.toFixed(1)}%`} /></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header"><div className="card-title">Portfolio Health Radar</div></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Radar dataKey="value" stroke="#F06222" fill="#F06222" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header"><div className="card-title">Status Distribution</div></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[{ name: 'On Track', count: onTrack }, { name: 'At Risk', count: atRisk }, { name: 'Delayed', count: delayed }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#F06222" name="Projects" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">All Projects</div></div>
        <div className="card-body"><DataTable columns={columns} data={pList} searchable pageSize={8} /></div>
      </div>
    </div>
  )
}

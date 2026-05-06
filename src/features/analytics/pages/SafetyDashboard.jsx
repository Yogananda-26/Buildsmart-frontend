import React from 'react'
import API from '../../../api/axiosInstance'
import useAsyncData from '../../../components/common/useAsyncData'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import KPICard from '../../../components/common/KPICard'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useProject } from '../../../context/ProjectContext'

const SEV_COLORS = { LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#EF4444', UNKNOWN: '#94A3B8', CRITICAL: '#7C3AED' }

export default function SafetyDashboard() {
  const trends = useAsyncData(() => API.get('/api/reports/safety/trends'))
  const inspections = useAsyncData(() => API.get('/api/reports/safety/inspections-summary'))
  const { selectedProject } = useProject()

  if (trends.loading || inspections.loading) return <LoadingSpinner message="Loading safety data..." />
  if (trends.error) return <ErrorMessage message={trends.error} onRetry={trends.reload} />

  const ins = inspections.data || {}
  const tList = trends.data || []

  const complianceRate = ins.total > 0 ? (((ins.completed ?? 0) + (ins.closed ?? 0)) / ins.total * 100).toFixed(1) : 0

  const pieStat = [
    { name: 'Scheduled', value: ins.scheduled ?? 0, color: '#3B82F6' },
    { name: 'In Progress', value: ins.inProgress ?? 0, color: '#F59E0B' },
    { name: 'Completed', value: ins.completed ?? 0, color: '#22C55E' },
    { name: 'Non-Compliant', value: ins.nonCompliant ?? 0, color: '#EF4444' },
    { name: 'Closed', value: ins.closed ?? 0, color: '#94A3B8' },
  ].filter(d => d.value > 0)

  const dateMap = {}
  for (const t of tList) {
    const d = String(t.date || '').slice(0, 10)
    if (!dateMap[d]) dateMap[d] = { date: d }
    dateMap[d][t.severityCategory || t.severity || 'UNKNOWN'] = (dateMap[d][t.severityCategory || t.severity || 'UNKNOWN'] || 0) + (t.incidentCount ?? t.count ?? 1)
  }
  const chartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-14)
  const severities = [...new Set(tList.map(t => t.severityCategory || t.severity || 'UNKNOWN'))]

  return (
    <div>
      <div className="page-header">
        <h1>Safety Compliance Analytics</h1>
        <p>{selectedProject ? `Project: ${selectedProject.projectName || selectedProject.projectId} — Incident trends and compliance tracking` : 'Incident trends, inspection summaries, and compliance tracking — all projects'}</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><KPICard title="Total Inspections" value={ins.total ?? 0} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Compliance Rate" value={`${complianceRate}%`} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Non-Compliant" value={ins.nonCompliant ?? 0} /></div>
        <div className="col-6 col-lg-3"><KPICard title="In Progress" value={ins.inProgress ?? 0} /></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header"><div className="card-title">Inspection Status Distribution</div></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieStat} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieStat.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header"><div className="card-title">Incident Trends by Severity</div></div>
            <div className="card-body">
              {chartData.length === 0 ? (
                <div className="text-center py-4 text-muted small">No incident data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                    <Legend />
                    {severities.map(sev => (
                      <Bar key={sev} dataKey={sev} stackId="a" fill={SEV_COLORS[sev] || '#94A3B8'} radius={[2, 2, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Inspection Pipeline</div></div>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {[
            { label: 'Scheduled', value: ins.scheduled ?? 0, color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'In Progress', value: ins.inProgress ?? 0, color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Completed', value: ins.completed ?? 0, color: '#22C55E', bg: '#F0FDF4' },
            { label: 'Non-Compliant', value: ins.nonCompliant ?? 0, color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Closed', value: ins.closed ?? 0, color: '#64748B', bg: '#F8F9FB' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '20px 16px', background: s.bg, borderRight: i < arr.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{s.label}</div>
              <div className="progress" style={{ marginTop: 10 }}>
                <div className="progress-bar" style={{ width: `${ins.total ? (s.value / ins.total) * 100 : 0}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import API from '../../../api/axiosInstance'
import useAsyncData from '../../../components/common/useAsyncData'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import KPICard from '../../../components/common/KPICard'
import DataTable from '../../../components/common/DataTable'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useProject } from '../../../context/ProjectContext'

export default function ResourceDashboard() {
  const util = useAsyncData(() => API.get('/api/reports/resources/utilization'))
  const labor = useAsyncData(() => API.get('/api/reports/resources/labor-allocation'))
  const { selectedProject } = useProject()

  if (util.loading) return <LoadingSpinner message="Loading resource data..." />
  if (util.error) return <ErrorMessage message={util.error} onRetry={util.reload} />

  const u = util.data || {}
  const allLabor = labor.data || []

  const lList = selectedProject ? allLabor.filter(l => (l.site || l.projectId || '').includes(selectedProject.projectId)) : allLabor

  const pieData = [
    { name: 'Used Hours', value: +(u.usedHours ?? 0).toFixed(0), color: '#F06222' },
    { name: 'Idle Hours', value: +(u.idleHours ?? 0).toFixed(0), color: '#E2E8F0' },
  ]

  const columns = [
    { key: 'site', label: 'Site / Project', render: (v, row) => <strong>{v || row.projectId || '—'}</strong> },
    { key: 'allocatedHours', label: 'Allocated Hours', sortable: true, render: v => (+(v ?? 0)).toFixed(0) + 'h' },
    { key: 'availableHours', label: 'Available Hours', sortable: true, render: v => (+(v ?? 0)).toFixed(0) + 'h' },
    { key: 'numberOfLabors', label: 'Laborers', sortable: true },
    { key: 'utilization', label: 'Utilization', sortable: true, render: (_, row) => {
      const pct = row.availableHours > 0 ? (row.allocatedHours / row.availableHours) * 100 : 0
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="progress" style={{ width: 80 }}>
            <div className="progress-bar" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{pct.toFixed(0)}%</span>
        </div>
      )
    }},
  ]

  const barData = lList.slice(0, 10).map(l => ({ name: (l.site || l.projectId || '').substring(0, 12), allocated: +(l.allocatedHours ?? 0).toFixed(0), available: +(l.availableHours ?? 0).toFixed(0) }))

  return (
    <div>
      <div className="page-header">
        <h1>Resource & Workforce Analytics</h1>
        <p>{selectedProject ? `Project: ${selectedProject.projectName || selectedProject.projectId} — Utilization and labor allocation` : 'Utilization rates, labor allocation, and workforce capacity — all projects'}</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><KPICard title="Used Hours" value={(+(u.usedHours ?? 0)).toFixed(0)} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Idle Hours" value={(+(u.idleHours ?? 0)).toFixed(0)} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Utilization Rate" value={`${((u.utilizationRate ?? 0) * 100).toFixed(1)}%`} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Total Laborers" value={u.totalLabors ?? 0} /></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header"><div className="card-title">Hours Breakdown</div></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v}h`} contentStyle={{ borderRadius: 8, border: 'none' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header"><div className="card-title">Labor Allocation by Site</div></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#F06222" radius={[4, 4, 0, 0]} name="Allocated" />
                  <Bar dataKey="available" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Available" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Labor Allocation Details</div></div>
        <div className="card-body">{labor.loading ? <LoadingSpinner /> : <DataTable columns={columns} data={lList} searchable pageSize={8} />}</div>
      </div>
    </div>
  )
}

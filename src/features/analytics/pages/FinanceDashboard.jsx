import React from 'react'
import API from '../../../api/axiosInstance'
import useAsyncData from '../../../components/common/useAsyncData'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import KPICard from '../../../components/common/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'

export default function FinanceDashboard() {
  const cashFlow = useAsyncData(() => API.get('/api/reports/finance/cash-flow'))
  const projects = useAsyncData(() => API.get('/api/reports/project/summary'))

  if (cashFlow.loading) return <LoadingSpinner message="Loading financial data..." />
  if (cashFlow.error) return <ErrorMessage message={cashFlow.error} onRetry={cashFlow.reload} />

  const cf = cashFlow.data || []
  const pList = projects.data || []

  const totalInflow = cf.reduce((s, r) => s + (r.invoices ?? r.inflow ?? 0), 0)
  const totalOutflow = cf.reduce((s, r) => s + (r.payments ?? r.outflow ?? 0), 0)
  const netFlow = cf.reduce((s, r) => s + (r.netOutflow ?? 0), 0)
  const alerts = pList.filter(p => Math.abs(p.budgetVariancePercent ?? 0) > 10)

  const cfChart = cf.map(r => ({ month: String(r.month || '').slice(0, 7), inflow: +(r.invoices ?? r.inflow ?? 0).toFixed(0), outflow: +(r.payments ?? r.outflow ?? 0).toFixed(0), net: +(r.netOutflow ?? (r.inflow - r.outflow) ?? 0).toFixed(0) }))

  return (
    <div>
      <div className="page-header">
        <h1>Financial Analytics</h1>
        <p>Budget variance, cash flow trends, and financial health indicators</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><KPICard title="Total Inflow" value={`₹${(totalInflow / 1e6).toFixed(2)}M`} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Total Outflow" value={`₹${(totalOutflow / 1e6).toFixed(2)}M`} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Net Cash Flow" value={`₹${(Math.abs(netFlow) / 1e6).toFixed(2)}M`} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Budget Alerts" value={alerts.length} /></div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Monthly Cash Flow</div>
            <div className="card-subtitle">Inflow vs Outflow over time</div>
          </div>
        </div>
        {cfChart.length === 0 ? (
          <div className="empty-state"><p>No cash flow data available</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={cfChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="inflow" stroke="#22C55E" strokeWidth={2.5} dot={false} name="Inflow" />
              <Line type="monotone" dataKey="outflow" stroke="#F06222" strokeWidth={2.5} dot={false} name="Outflow" />
              <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Net" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <div className="card-title">Budget Variance by Project</div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={pList.slice(0, 8).map(p => ({ name: (p.projectName || p.projectId || '').substring(0, 12), variance: +(p.budgetVariancePercent ?? 0).toFixed(1) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                  <ReferenceLine y={10} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Alert 10%', fontSize: 10, fill: '#F59E0B' }} />
                  <ReferenceLine y={0} stroke="#94A3B8" />
                  <Bar dataKey="variance" radius={[4, 4, 0, 0]} name="Variance %" fill="#F06222" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="card-title">Budget Alerts</div>
              <span className="badge bg-warning text-dark">{alerts.length} alerts</span>
            </div>
            <div className="card-body">
              {alerts.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <div style={{ fontSize: 32 }}>✅</div>
                  <p className="mt-2 small">No budget alerts — all projects within threshold</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {alerts.map(p => (
                    <div key={p.projectId} className="alert alert-warning alert-bar-warning d-flex gap-2 py-2 mb-0">
                      <div>
                        <div className="fw-bold small">{p.projectName}</div>
                        <small className="text-muted">Budget variance: <strong style={{ color: '#F59E0B' }}>{(p.budgetVariancePercent ?? 0).toFixed(1)}%</strong> — threshold exceeded</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

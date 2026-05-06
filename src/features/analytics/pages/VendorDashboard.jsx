import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../../api/axiosInstance'
import useAsyncData from '../../../components/common/useAsyncData'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import KPICard from '../../../components/common/KPICard'
import StatusBadge from '../../../components/common/StatusBadge'
import DataTable from '../../../components/common/DataTable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { useProject } from '../../../context/ProjectContext'
import { useAuth } from '../../../context/AuthContext'

const TABS = ['Performance', 'Compliance', 'Spend']

export default function VendorDashboard() {
  const [tab, setTab] = useState('Performance')
  const performance = useAsyncData(() => API.get('/api/reports/vendor/performance'))
  const compliance = useAsyncData(() => API.get('/api/reports/vendor/compliance'))
  const spend = useAsyncData(() => API.get('/api/reports/vendor/spend'))
  const { selectedProject } = useProject()
  const { user } = useAuth()
  const navigate = useNavigate()

  const isVendorOnly = (user?.role || '').toUpperCase() === 'VENDOR'

  const vList = performance.data || []
  const comp = compliance.data || {}
  const allSpend = spend.data || []
  const spendList = selectedProject ? allSpend.filter(s => (s.category || '').includes(selectedProject.projectId)) : allSpend

  const avgQuality = vList.length ? vList.reduce((s, v) => s + (v.qualityScore ?? 0), 0) / vList.length : 0
  const avgDelivery = vList.length ? vList.reduce((s, v) => s + (v.onTimeDeliveryRate ?? 0), 0) / vList.length : 0

  const columns = [
    { key: 'vendorId', label: 'Vendor ID', sortable: true },
    { key: 'vendorName', label: 'Vendor', sortable: true, render: (v, row) => (
      <button style={{ background: 'none', color: '#F06222', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate(`/analytics/vendors/${row.vendorId}`)}>{v}</button>
    )},
    { key: 'overallRating', label: 'Rating', render: v => <StatusBadge value={v} /> },
    { key: 'onTimeDeliveryRate', label: 'On-Time %', sortable: true, render: v => `${(v ?? 0).toFixed(1)}%` },
    { key: 'qualityScore', label: 'Quality Score', sortable: true, render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="progress" style={{ width: 70 }}>
          <div className="progress-bar" style={{ width: `${v ?? 0}%`, background: (v ?? 0) >= 80 ? '#22C55E' : '#F59E0B' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{(v ?? 0).toFixed(1)}</span>
      </div>
    )},
    { key: 'costVariance', label: 'Cost Variance', sortable: true, render: v => (
      <span style={{ fontWeight: 700, color: Math.abs(v ?? 0) > 5 ? '#EF4444' : '#22C55E' }}>{(v ?? 0) > 0 ? '+' : ''}{(v ?? 0).toFixed(1)}%</span>
    )},
    { key: 'activeContracts', label: 'Contracts', sortable: true },
  ]

  if (performance.loading) return <LoadingSpinner message="Loading vendor data..." />

  const visibleTabs = isVendorOnly ? ['Performance'] : TABS

  return (
    <div>
      <div className="page-header">
        <h1>Vendor Analytics</h1>
        <p>{selectedProject ? `Project: ${selectedProject.projectName || selectedProject.projectId} — Performance and spend analysis` : 'Performance metrics, compliance tracking, and spend analysis — all projects'}</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><KPICard title="Total Vendors" value={comp.totalVendors ?? vList.length} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Avg Quality Score" value={avgQuality.toFixed(1)} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Avg On-Time %" value={`${avgDelivery.toFixed(1)}%`} /></div>
        <div className="col-6 col-lg-3"><KPICard title="Non-Compliant" value={comp.nonCompliantVendors ?? 0} /></div>
      </div>

      <div className="tabs">
        {visibleTabs.map(t => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === 'Performance' && (
        <div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header"><div className="card-title">Quality Score vs On-Time Delivery</div></div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={vList.slice(0, 10).map(v => ({ name: (v.vendorName || '').substring(0, 10), quality: +(v.qualityScore ?? 0).toFixed(1), delivery: +(v.onTimeDeliveryRate ?? 0).toFixed(1) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                      <Legend />
                      <Bar dataKey="quality" fill="#F06222" radius={[4, 4, 0, 0]} name="Quality Score" />
                      <Bar dataKey="delivery" fill="#3B82F6" radius={[4, 4, 0, 0]} name="On-Time %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header"><div className="card-title">Rating Distribution</div></div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={['A+','A','B+','B','C'].map(r => ({ name: r, value: vList.filter(v => v.overallRating === r).length })).filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {['#22C55E','#4ADE80','#F59E0B','#FB923C','#EF4444'].map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Vendor Performance Table</div></div>
            <div className="card-body"><DataTable columns={columns} data={vList} searchable pageSize={8} /></div>
          </div>
        </div>
      )}

      {tab === 'Compliance' && !isVendorOnly && (compliance.loading ? <LoadingSpinner /> : (
        <div className="card">
          <div className="card-header"><div className="card-title">Vendor Compliance Summary</div></div>
          <div className="row g-3">
            {[{ label: 'Total Vendors', value: comp.totalVendors ?? 0, color: '#3B82F6' }, { label: 'Compliant', value: comp.compliantVendors ?? 0, color: '#22C55E' }, { label: 'Non-Compliant', value: comp.nonCompliantVendors ?? 0, color: '#EF4444' }, { label: 'Pending Review', value: comp.pendingReview ?? 0, color: '#F59E0B' }, { label: 'Compliance Rate', value: `${(comp.complianceRate ?? 0).toFixed(1)}%`, color: '#F06222' }, { label: 'Contracts Expiring Soon', value: comp.contractsExpiringSoon ?? 0, color: '#7C3AED' }].map(s => (
              <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {tab === 'Spend' && !isVendorOnly && (spend.loading ? <LoadingSpinner /> : (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><div className="card-title">Spend by Category (Project)</div></div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={spendList.map(s => ({ name: (s.category || '').substring(0, 12), budgeted: +(s.budgeted ?? 0).toFixed(0), actual: +(s.actual ?? 0).toFixed(0) }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: 'none' }} />
                <Legend />
                <Bar dataKey="budgeted" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Budgeted" />
                <Bar dataKey="actual" fill="#F06222" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Spend Details</div></div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light"><tr><th>Category</th><th>Budgeted</th><th>Actual</th><th>Variance</th><th>Vendors</th></tr></thead>
                <tbody>
                  {spendList.map((s, i) => (
                    <tr key={i}>
                      <td><strong>{s.category}</strong></td>
                      <td>₹{(+(s.budgeted ?? 0)).toLocaleString()}</td>
                      <td>₹{(+(s.actual ?? 0)).toLocaleString()}</td>
                      <td><span style={{ fontWeight: 700, color: (s.variance ?? 0) >= 0 ? '#22C55E' : '#EF4444' }}>{(s.variance ?? 0) > 0 ? '+' : ''}₹{(+(s.variance ?? 0)).toLocaleString()}</span></td>
                      <td>{s.vendorCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

import React from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function KPICard({ label, value, change, changeLabel, icon: Icon, iconBg = '#FFF0E8', iconColor = '#F06222', sparkData, color = '#F06222', prefix = '', suffix = '' }) {
  const isUp = (change || 0) > 0
  return (
    <div className="card h-100 kpi-card shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center mb-2">
          {Icon ? (
            <div className="kpi-icon" style={{ background: iconBg, color: iconColor }}>
              <Icon size={18} />
            </div>
          ) : (
            <div className="kpi-icon" style={{ background: '#eef2ff', color: '#3b82f6' }}>#</div>
          )}
          <div className="ms-3">
            <div className="kpi-label">{label || ''}</div>
            <div className="kpi-value">{prefix}{value}{suffix}</div>
          </div>
        </div>

        <div className="mt-auto">
          {change !== undefined && (
            <div className={`kpi-change ${isUp ? 'text-success' : 'text-danger'}`}>
              <span style={{ fontSize: 12 }}>{isUp ? '▲' : '▼'}</span>
              <span className="ms-2">{Math.abs(change)}% {changeLabel || 'vs last period'}</span>
            </div>
          )}
          {sparkData && (
            <div className="kpi-sparkline mt-2">
              <ResponsiveContainer width="100%" height={44}>
                <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sg-${label})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

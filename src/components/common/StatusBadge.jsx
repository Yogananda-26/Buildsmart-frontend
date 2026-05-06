import React from 'react'

const MAP = {
  ACTIVE: 'badge-success', ON_TRACK: 'badge-success', COMPLETED: 'badge-success', DELIVERED: 'badge-success',
  COMPLIANT: 'badge-success', A: 'badge-success', 'A+': 'badge-success',
  AT_RISK: 'badge-warning', IN_PROGRESS: 'badge-warning', PENDING: 'badge-warning', B: 'badge-warning', 'B+': 'badge-warning',
  DELAYED: 'badge-danger', NON_COMPLIANT: 'badge-danger', INACTIVE: 'badge-danger', SUSPENDED: 'badge-danger',
  BLACKLISTED: 'badge-danger', HIGH: 'badge-danger', C: 'badge-danger',
  SCHEDULED: 'badge-info', LOW: 'badge-info', MEDIUM: 'badge-warning',
  CLOSED: 'badge-muted', CANCELLED: 'badge-muted', UNKNOWN: 'badge-muted',
}

export default function StatusBadge({ value }) {
  const cls = MAP[String(value).toUpperCase()] || 'badge-muted'
  return <span className={`badge ${cls}`}>{value}</span>
}

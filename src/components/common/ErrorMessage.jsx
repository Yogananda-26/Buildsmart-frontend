import React from 'react'

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ color: '#EF4444', fontWeight: 700, marginBottom: 8 }}>Error</div>
      <div style={{ color: '#64748B', marginBottom: 12 }}>{(error && (error.message || String(error))) || 'An unexpected error occurred.'}</div>
      {onRetry && <button className="btn btn-sm btn-primary" onClick={onRetry}>Retry</button>}
    </div>
  )
}

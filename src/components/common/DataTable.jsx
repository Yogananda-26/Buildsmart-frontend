import React, { useState } from 'react'

export default function DataTable({ columns, data = [], searchable = false, pageSize = 10 }) {
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(0)

  const filtered = data.filter(row =>
    !searchable || columns.some(c => String(row[c.key] ?? '').toLowerCase().includes(search.toLowerCase()))
  )
  const sorted = sortCol
    ? [...filtered].sort((a, b) => { const va = a[sortCol] ?? ''; const vb = b[sortCol] ?? ''; return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1) })
    : filtered
  const total = sorted.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const rows = sorted.slice(page * pageSize, page * pageSize + pageSize)
  const handleSort = key => { if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(key); setSortDir('asc') }; setPage(0) }

  return (
    <div>
      {searchable && (
        <div className="position-relative mb-3" style={{ maxWidth: 280 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>🔍</span>
          <input className="form-control form-control-sm" style={{ paddingLeft: 32 }} placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map(c => (
                <th key={c.key} onClick={() => c.sortable !== false && handleSort(c.key)} style={{ cursor: c.sortable !== false ? 'pointer' : 'default', userSelect: 'none' }}>
                  <span className="d-flex align-items-center gap-1">
                    {c.label}
                    {sortCol === c.key && (sortDir === 'asc' ? <span style={{ fontSize: 12 }}>▲</span> : <span style={{ fontSize: 12 }}>▼</span>)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={columns.length} className="text-center text-muted py-5">No data found</td></tr>
              : rows.map((row, i) => (
                <tr key={i}>
                  {columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '—')}</td>)}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="d-flex align-items-center justify-content-between mt-3">
          <small className="text-muted">Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}</small>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              {Array.from({ length: pages }, (_, i) => (
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i)} style={page === i ? { background: '#F06222', borderColor: '#F06222' } : {}}>{i + 1}</button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}

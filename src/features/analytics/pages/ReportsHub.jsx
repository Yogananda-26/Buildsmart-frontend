import React from 'react'
import { Navigate } from 'react-router-dom'

// ReportsHub removed — redirect to primary analytics page if accessed
export default function ReportsHub() {
  return <Navigate to="/analytics/finance" replace />
}

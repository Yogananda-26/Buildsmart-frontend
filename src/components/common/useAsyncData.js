import { useState, useEffect, useRef } from 'react'

export default function useAsyncData(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fn()
        const val = res && res.data !== undefined ? res.data : res
        if (mounted.current) setData(val)
      } catch (err) {
        if (mounted.current) setError(err)
      } finally {
        if (mounted.current) setLoading(false)
      }
    }
    load()
    return () => { mounted.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fn()
      const val = res && res.data !== undefined ? res.data : res
      if (mounted.current) setData(val)
    } catch (err) {
      if (mounted.current) setError(err)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }

  return { data, loading, error, reload }
}

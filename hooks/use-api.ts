"use client"

import { useState, useEffect } from "react"

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

const jsonHeaders = { "Content-Type": "application/json" }

export function useApi<T>(url: string, options?: RequestInit): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          ...(options || {}),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "An error occurred")
        setState({ data, loading: false, error: null })
      } catch (error: any) {
        setState({
          data: null,
          loading: false,
          error: error.message || "An error occurred",
        })
      }
    }
    fetchData()
  }, [url])

  return state
}

export async function apiGet<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    ...(options || {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || "Request failed")
  return data as T
}

export async function apiPost<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    ...(options || {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || "Request failed")
  return data as T
}

export async function apiPut<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: jsonHeaders,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    ...(options || {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || "Request failed")
  return data as T
}

export async function apiPatch<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    ...(options || {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || "Request failed")
  return data as T
}

export async function apiDelete<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    ...(options || {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || "Request failed")
  return data as T
}

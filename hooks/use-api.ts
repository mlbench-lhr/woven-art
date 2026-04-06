"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api/axios-config"
import type { AxiosRequestConfig } from "axios"

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(url: string, options?: AxiosRequestConfig): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const response = await api.get<T>(url, options)
        setState({ data: response.data, loading: false, error: null })
      } catch (error: any) {
        setState({
          data: null,
          loading: false,
          error: error.response?.data?.error || error.message || "An error occurred",
        })
      }
    }

    fetchData()
  }, [url])

  return state
}

export async function apiCall<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.request<T>({
      url,
      ...options,
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || "An error occurred")
  }
}

// Convenience methods for different HTTP methods using function declarations to avoid JSX parsing conflicts
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<T>(url, config)
  return response.data
}

export async function apiPost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.post<T>(url, data, config)
  return response.data
}

export async function apiPut<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.put<T>(url, data, config)
  return response.data
}

export async function apiPatch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.patch<T>(url, data, config)
  return response.data
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete<T>(url, config)
  return response.data
}

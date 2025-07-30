// composables/useApiFetch.ts
import { useAuth } from './useAuth'
import { useRuntimeConfig } from '#app'

export const useApiFetch = () => {
  const { tokenCookie } = useAuth()
  const config = useRuntimeConfig()

  const apiFetch = async <T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      body?: any
      headers?: Record<string, string>
    } = {}
  ): Promise<T> => {
    const { method = 'GET', body, headers = {} } = options

    const fetchOptions: any = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenCookie.value ? { 'Authorization': `Bearer ${tokenCookie.value}` } : {}),
        ...headers
      }
    }

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body)
    }

    return await $fetch<T>(endpoint, {
      baseURL: config.public.apiBase,
      ...fetchOptions
    })
  }

  return {
    apiFetch,
    // 便捷方法
    get: <T = any>(endpoint: string, headers?: Record<string, string>) => 
      apiFetch<T>(endpoint, { method: 'GET', headers }),
    
    post: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
      apiFetch<T>(endpoint, { method: 'POST', body, headers }),
    
    put: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
      apiFetch<T>(endpoint, { method: 'PUT', body, headers }),
    
    patch: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
      apiFetch<T>(endpoint, { method: 'PATCH', body, headers }),
    
    delete: <T = any>(endpoint: string, headers?: Record<string, string>) => 
      apiFetch<T>(endpoint, { method: 'DELETE', headers })
  }
} 
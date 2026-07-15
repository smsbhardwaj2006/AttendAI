import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('attendai_access_token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await authApi.me()
        setUser(data)
      } catch {
        localStorage.removeItem('attendai_access_token')
        localStorage.removeItem('attendai_refresh_token')
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password)
    localStorage.setItem('attendai_access_token', data.access)
    localStorage.setItem('attendai_refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    const refresh = localStorage.getItem('attendai_refresh_token')
    try {
      if (refresh) await authApi.logout(refresh)
    } catch {
      // best-effort — clear local state regardless
    }
    localStorage.removeItem('attendai_access_token')
    localStorage.removeItem('attendai_refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

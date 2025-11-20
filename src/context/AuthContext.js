import React, { createContext, useContext, useEffect, useState } from "react"
import { getToken, setToken, removeToken, issueStaticToken } from "../utils/auth"
const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[0]))
        setUser({ username: payload.username })
        setRole(payload.role || "user")
      } catch {
        removeToken()
        setUser(null)
        setRole(null)
      }
    } else {
      setUser(null)
      setRole(null)
    }
    setLoading(false)
  }, [])

  function login({ username, password, role: selectedRole }) {
    if (selectedRole === "user" && username === "niks" && password === "123") {
      const token = issueStaticToken(username, "user")
      setToken(token)
      setUser({ username })
      setRole("user")
      return true
    } else if (selectedRole === "admin" && username === "admin" && password === "321") {
      const token = issueStaticToken(username, "admin")
      setToken(token)
      setUser({ username })
      setRole("admin")
      return true
    }
    return false
  }

  function logout() {
    removeToken()
    setUser(null)
    setRole(null)
  }

  function isAuthenticated() {
    return !!getToken()
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}
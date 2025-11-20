import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/login"
import Layout from "./pages/layout"
import { AuthProvider, useAuth } from "./context/AuthContext"
import ProtectedRoute from "./ProtectedRoute"
import DashboardPage from "./pages/userPanel/dashboard"
import UserProfilePage from "./pages/userPanel/userProfile"
import AdminPanelPage from "./pages/userPanel/AdminPanel"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function AppRoutesContent() {
  const { isAuthenticated } = useAuth()
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="userProfile" element={<UserProfilePage />} />
          <Route path="admin" element={<AdminPanelPage />} />
        </Route>
      </Routes>
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar closeOnClick pauseOnHover />
    </BrowserRouter>
  )
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <AppRoutesContent />
    </AuthProvider>
  )
}
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/login";
import Layout from "./pages/layout";
import DashboardPage from "./pages/userPanel/dashboard";
import UserProfilePage from "./pages/userPanel/userProfile";
import AdminPanelPage from "./pages/userPanel/AdminPanel";
import LeavesHomePage from "./pages/userPanel/leaves";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/userProfile" replace /> : <Login />}
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<UserProfilePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="userProfile" element={<UserProfilePage />} />
              <Route path="leaves" element={<LeavesHomePage />} />
              <Route path="admin" element={<AdminPanelPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-center" autoClose={2500} hideProgressBar closeOnClick pauseOnHover />
    </>
  );
}
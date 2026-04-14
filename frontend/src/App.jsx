import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./services/store";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const ProtectedRoute = ({ children }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { accessToken, user } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <div className="app-loading">Checking access...</div>;
  }

  if (user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  const { accessToken, user, getCurrentUser } = useAuthStore();

  useEffect(() => {
    if (accessToken && !user) {
      getCurrentUser();
    }
  }, [accessToken, user, getCurrentUser]);

  return (
    <Router>
      <Suspense fallback={<div className="app-loading">Preparing Navi...</div>}>
        <Routes>
          <Route path="/login" element={accessToken ? <Navigate to="/home" replace /> : <LoginPage />} />
          <Route path="/signup" element={accessToken ? <Navigate to="/home" replace /> : <SignupPage />} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/staff" element={<RoleRoute allowedRoles={["staff", "admin"]}><StaffDashboard /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard /></RoleRoute>} />
          <Route path="/" element={<Navigate to={accessToken ? "/home" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={accessToken ? "/home" : "/login"} replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

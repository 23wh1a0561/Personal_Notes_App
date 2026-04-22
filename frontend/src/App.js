import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

function RoleRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={role === "admin" ? "/admin-dashboard" : "/dashboard"} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRole="user">
              <Dashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <RoleRoute allowedRole="admin">
              <AdminDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

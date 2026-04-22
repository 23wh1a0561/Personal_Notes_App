import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalNotes: 0,
    blockedUsers: 0
  });
  const [currentAdminId, setCurrentAdminId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const role = localStorage.getItem("role");

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(res.data.users || []);
      setSummary(res.data.summary || {});
      setCurrentAdminId(res.data.currentAdminId || "");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    fetchUsers();
  }, [fetchUsers, role]);

  const handleBlockToggle = async (user) => {
    try {
      setActionLoading(user._id);
      const token = localStorage.getItem("token");

      const res = await axios.patch(
        `http://localhost:5001/admin/users/${user._id}/block`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(res.data.message);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name}'s account and notes?`);
    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(user._id);
      const token = localStorage.getItem("token");

      const res = await axios.delete(`http://localhost:5001/admin/users/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert(res.data.message);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <div className="admin-dashboard-hero glass-panel">
          <div>
            <p className="eyebrow">Control Center</p>
            <h1>Admin Dashboard</h1>
            <p className="hero-copy">
              Track users, review activity, and manage access from one place.
            </p>
          </div>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass-panel">
            <span>Total Users</span>
            <strong>{summary.totalUsers || 0}</strong>
          </div>
          <div className="stat-card glass-panel">
            <span>Total Admins</span>
            <strong>{summary.totalAdmins || 0}</strong>
          </div>
          <div className="stat-card glass-panel">
            <span>Total Notes</span>
            <strong>{summary.totalNotes || 0}</strong>
          </div>
          <div className="stat-card glass-panel">
            <span>Blocked Users</span>
            <strong>{summary.blockedUsers || 0}</strong>
          </div>
        </div>

        <div className="users-panel glass-panel">
          <div className="users-panel-header">
            <h2>User Activity</h2>
            <p>Each card shows user role, account status, and how many notes they created.</p>
          </div>

          {loading ? (
            <p className="status-text">Loading dashboard...</p>
          ) : users.length === 0 ? (
            <p className="status-text">No users found.</p>
          ) : (
            <div className="users-grid">
              {users.map((user) => {
                const isCurrentAdmin = currentAdminId === user._id;
                const isBusy = actionLoading === user._id;

                return (
                  <div key={user._id} className="user-card glass-card">
                    <div className="user-card-top">
                      <div>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                      </div>
                      <span className={`role-pill ${user.role}`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="user-metrics">
                      <div>
                        <span>Status</span>
                        <strong>{user.blocked ? "Blocked" : "Active"}</strong>
                      </div>
                      <div>
                        <span>Notes Created</span>
                        <strong>{user.notesCount || 0}</strong>
                      </div>
                    </div>

                    <div className="user-actions">
                      <button
                        className="action-btn block-btn"
                        onClick={() => handleBlockToggle(user)}
                        disabled={isCurrentAdmin || isBusy}
                      >
                        {user.blocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(user)}
                        disabled={isCurrentAdmin || isBusy}
                      >
                        Delete
                      </button>
                    </div>

                    {isCurrentAdmin && (
                      <p className="self-note">Your own admin account cannot be blocked or deleted.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

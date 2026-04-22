import { useEffect, useState } from "react";
import axios from "axios";
import CreateNote from "../components/CreateNote";
import NotesList from "../components/NotesList";
import UpdateNote from "../components/UpdateNote";
import DeleteNote from "../components/DeleteNote";
import "./Dashboard.css";

function Dashboard() {
  const [active, setActive] = useState("home");
  const [profile, setProfile] = useState({ name: "", email: "" });
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role === "admin") {
      window.location.href = "/admin-dashboard";
    }
  }, [role]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const res = await axios.get("http://localhost:5001/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProfile({
          name: res.data.name || "",
          email: res.data.email || ""
        });
      } catch (err) {
        console.log("Error fetching profile", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <button className="profile-trigger" onClick={() => setActive("profile")}>
          <span className="profile-icon" aria-hidden="true">👤</span>
          My Profile
        </button>
        <h2 className="logo">Notes App</h2>

        {role === "admin" && (
          <p style={{ color: "#ffd700", marginBottom: "10px" }}>
            Admin
          </p>
        )}

        <div className="menu">
          <button onClick={() => setActive("create")}>Create Note</button>
          <button onClick={() => setActive("view")}>View Notes</button>
          <button onClick={() => setActive("update")}>Update Note</button>
          <button onClick={() => setActive("delete")}>Delete Note</button>

          {role === "admin" && (
            <button onClick={() => setActive("all")}>
              All Users Notes
            </button>
          )}
        </div>

        <button
          className="logout"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      <div className="content">
        {active === "home" && (
          <div className="welcome glass-box">
            <h1>
              Welcome back!
              <span className="welcome-subtitle"> Manage your notes easily and securely.</span>
            </h1>
          </div>
        )}

        {active === "profile" && (
          <div className="profile-card glass-box">
            <h2>My Profile</h2>
            <div className="profile-row">
              <span className="profile-label">Username</span>
              <p>{profile.name || "Not available"}</p>
            </div>
            <div className="profile-row">
              <span className="profile-label">Name</span>
              <p>{profile.name || "Not available"}</p>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email</span>
              <p>{profile.email || "Not available"}</p>
            </div>
          </div>
        )}

        {active === "create" && <CreateNote />}
        {active === "view" && <NotesList />}
        {active === "update" && <UpdateNote />}
        {active === "delete" && <DeleteNote />}
        {active === "all" && <NotesList />}
      </div>
    </div>
  );
}

export default Dashboard;

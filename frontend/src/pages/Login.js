import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLogin && !form.name.trim()) {
      nextErrors.name = "Please fill this field";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Please fill this field";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email with @";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Please fill this field";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });

    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5001/login", {
          email: form.email.trim(),
          password: form.password
        });

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.role);

          alert("Login successful");

          if (res.data.role === "admin") {
            window.location.href = "/admin-dashboard";
          } else {
            window.location.href = "/dashboard";
          }

        } else {
          alert(res.data.message);
        }

      } else {
        const res = await axios.post("http://localhost:5001/register", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role
        });

        alert(res.data.message);
        setIsLogin(true);
      }

    } catch (err) {
      alert(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="wrapper">
      <div className="container">

        <div className="left">
          <div className="left-content">
            <h1 className="main-title">NOTES APP</h1>
            <p className="desc">
              Manage your notes easily and securely.
            </p>
          </div>
        </div>

        <div className="right">
          <div className="card">

            {!isLogin && (
              <>
                <div className="field-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter Name"
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? "input-error" : ""}
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="user">Register as User</option>
                  <option value="admin">Register as Admin</option>
                </select>
              </>
            )}

            <div className="field-group">
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="field-group">
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <button className="login-btn" onClick={handleSubmit}>
              {isLogin ? "Log In" : "Register"}
            </button>

            <hr />

            <button
              className="signup-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
            >
              {isLogin ? "Create new account" : "Already have account? Login"}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;

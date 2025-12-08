// FRONT-END/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardLayout from "../components/CardLayout";
import { post, API } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("Logging in...");
    const res = await post("/auth/login", { email, password });
    if (res.status === 200 && res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
      API.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setMsg("Login successful. Redirecting...");
      setTimeout(() => navigate("/dashboard"), 600);
    } else {
      setMsg(res.data?.error || "Login failed");
    }
  }

  return (
    <CardLayout title="Fitness Tracker — Login">
      <form onSubmit={handleSubmit}>
        <label style={{ color: "#b8c6d9" }}>Email</label>
        <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" required />

        <label style={{ color: "#b8c6d9" }}>Password</label>
        <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" required />

        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/forgot" style={{ color: "#3ad1ff" }}>Forgot password?</a>
        </div>

        <button className="btn" type="submit" style={{ marginTop: 18 }}>Login</button>
      </form>

      <p style={{ marginTop: 12 }}>
        Don't have an account? <a href="/register" style={{ color: "#8bd4ff" }}>Register</a>
      </p>

      <div style={{ marginTop: 12, color: msg.toLowerCase().includes("failed") ? "crimson" : "#b8c6d9" }}>{msg}</div>
    </CardLayout>
  );
}

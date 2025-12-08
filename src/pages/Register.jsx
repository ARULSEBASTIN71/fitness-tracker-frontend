// FRONT-END/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardLayout from "../components/CardLayout";
import { post } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("Creating account...");
    const res = await post("/auth/register", { email, password });
    if (res.status === 201) {
      setMsg("Account created. Check OTP in email (or console). Redirecting to login...");
      setTimeout(() => navigate("/"), 1000);
    } else {
      setMsg(res.data?.error || "Register failed");
    }
  }

  return (
    <CardLayout title="Fitness Tracker — Register" subtitle="Create your free account">
      <form onSubmit={handleSubmit}>
        <label style={{ color: "#b8c6d9" }}>Email</label>
        <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" required />

        <label style={{ color: "#b8c6d9" }}>Password</label>
        <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" minLength={6} required />

        <button className="btn" type="submit" style={{ marginTop: 16 }}>Create account</button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/" style={{ color: "#8bd4ff" }}>Login</a>
      </p>

      <div style={{ marginTop: 8, color: "#f66" }}>{msg}</div>
    </CardLayout>
  );
}

// FRONT-END/src/pages/Forgot.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardLayout from "../components/CardLayout";
import { post } from "../api";

export default function Forgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("Sending OTP...");

    const res = await post("/auth/forgot-password", { email });

    if (res.status === 200) {
      // 🔥 DEV MODE: show OTP from backend response
      if (res.data && res.data.otp) {
        alert(`Your OTP (DEV MODE): ${res.data.otp}`);
      }

      localStorage.setItem("emailForReset", email);
      setMsg("OTP generated. Use the code shown and proceed to verify.");
      setTimeout(() => navigate("/verify-otp"), 700);
    } else {
      setMsg(res.data?.error || "Failed to send OTP");
    }
  }

  return (
    <CardLayout title="Fitness Tracker — Forgot Password">
      <form onSubmit={handleSubmit}>
        <label style={{ color: "#b8c6d9" }}>Email</label>
        <input
          className="input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          required
        />

        <button className="btn" type="submit" style={{ marginTop: 12 }}>
          Send OTP
        </button>
      </form>

      <div style={{ marginTop: 12, color: "#b8c6d9" }}>{msg}</div>
    </CardLayout>
  );
}

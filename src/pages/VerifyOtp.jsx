// FRONT-END/src/pages/VerifyOtp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardLayout from "../components/CardLayout";
import { post } from "../api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem("emailForReset") || "");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !otp) {
      setMsg("Please enter email and OTP");
      return;
    }
    setMsg("Verifying OTP...");
    const res = await post("/auth/verify-otp", { email, otp });
    if (res.status === 200) {
      if (res.data?.resetToken) {
        localStorage.setItem("resetToken", res.data.resetToken);
        localStorage.setItem("emailForReset", email);
      }
      setMsg("OTP verified. Redirecting...");
      setTimeout(() => navigate("/reset-password"), 700);
    } else {
      setMsg(res.data?.error || "Verify failed");
    }
  }

  return (
    <CardLayout title="Fitness Tracker — Verify OTP">
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>OTP</label>
        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required />

        <button className="btn" type="submit">Verify OTP</button>
      </form>

      <div style={{ marginTop: 12 }}>{msg}</div>
    </CardLayout>
  );
}

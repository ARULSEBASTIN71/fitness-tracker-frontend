// FRONT-END/src/pages/ResetPassword.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardLayout from "../components/CardLayout";
import { post } from "../api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("emailForReset") || "";
    const storedToken = localStorage.getItem("resetToken") || "";
    setEmail(storedEmail);
    setResetToken(storedToken);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) { setMsg("Enter a new password"); return; }
    if (!resetToken || !email) { setMsg("Missing reset token or email. Please request a new OTP."); return; }

    setMsg("Resetting password...");
    const res = await post("/auth/reset-password", { email, resetToken, password });
    if (res.status === 200) {
      setMsg("Password reset successful. Redirecting to login...");
      localStorage.removeItem("resetToken");
      localStorage.removeItem("emailForReset");
      setTimeout(() => navigate("/"), 900);
    } else {
      setMsg(res.data?.error || "Reset failed");
    }
  }

  return (
    <CardLayout title="Fitness Tracker — Reset Password" subtitle="Choose a strong new password">
      <form id="resetForm" onSubmit={handleSubmit}>
        <label>Account email</label>
        <input type="email" name="email" value={email} readOnly />

        <label>New Password</label>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />

        <button className="btn" type="submit">Reset Password</button>
      </form>

      <div id="resetMsg" style={{ marginTop: 12 }}>{msg}</div>
    </CardLayout>
  );
}

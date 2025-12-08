// FRONT-END/src/components/CardLayout.jsx
import React from "react";
import "./../styles.css";

export default function CardLayout({ title, subtitle, children }) {
  return (
    <div style={page}>
      <div style={left}>
        <div style={logoWrap}>
          <div style={logo}>🏋️‍♂️</div>
          <div>
            <h1 style={{ margin: 0, color: "#fff" }}>Fitness Tracker</h1>
            <small style={{ color: "#b8c6d9" }}>Track. Train. Transform.</small>
          </div>
        </div>

        <h2 style={heroTitle}>Train smarter. Track better.</h2>
        <p style={{ color: "#b8c6d9", maxWidth: 520 }}>
          Fitness Tracker helps you monitor workouts, set goals and analyze progress — all in one clean, focused app.
        </p>

        <div style={features}>
          <div style={feature}> <strong>Workouts</strong><div>Create sessions, log sets & reps, and track PRs.</div></div>
          <div style={feature}> <strong>Progress</strong><div>Charts, weight history and performance analytics.</div></div>
          <div style={feature}> <strong>Goals</strong><div>Set targets for weight, reps, or skills — stay consistent.</div></div>
          <div style={feature}> <strong>Secure</strong><div>Encrypted accounts and safe auth flows.</div></div>
        </div>
      </div>

      <div style={cardColumn}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>{title}</h3>
          {subtitle && <p style={{ color: "#b8c6d9" }}>{subtitle}</p>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

const page = {
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(180deg,#0a2540 0%, #071031 100%)",
  padding: 48,
  gap: 32,
  color: "#fff",
  fontFamily: "Inter, system-ui, Arial"
};
const left = { flex: 1, maxWidth: 820 };
const logoWrap = { display: "flex", gap: 12, alignItems: "center", marginBottom: 24 };
const logo = { width: 54, height: 54, borderRadius: 12, background: "#3ea8ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#042" };
const heroTitle = { fontSize: 40, margin: "10px 0 18px" };
const features = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 24 };
const feature = { background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, color: "#cfe3ff" };

const cardColumn = { width: 420, display: "flex", alignItems: "flex-start" };
const card = { background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 22, boxShadow: "0 8px 30px rgba(0,0,0,0.6)" };

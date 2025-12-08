import React from "react";
import { Link } from "react-router-dom";

/* Small inline SVG logo (no external file) */
function Logo() {
  return (
    <div className="logo" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <rect x="2" y="2" width="20" height="20" rx="5" fill="white" opacity="0.12"/>
        <path d="M6 14c1.5-3 4-4 6-4s4.5 1 6 4" stroke="#04203a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8.5" cy="9" r="1.6" fill="#04203a"/>
        <circle cx="15.5" cy="9" r="1.6" fill="#04203a"/>
      </svg>
    </div>
  );
}

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <Logo />
        <div>
          <div className="app-title">Fitness Tracker</div>
          <div style={{fontSize:12, color:'var(--muted)'}}>Track. Train. Transform.</div>
        </div>
      </div>

      <div className="header-actions">
        <Link to="/">Home</Link>
        <Link to="/register">Sign up</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </header>
  );
}

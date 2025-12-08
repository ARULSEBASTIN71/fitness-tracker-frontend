// FRONT-END/src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css"; // ensure styles imported
import { API } from "./api";

// attach auth token header if present
const token = localStorage.getItem("authToken");
if (token) {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// create root and render app
const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("No #root element found — make sure index.html contains <div id=\"root\"></div>");
}
const root = createRoot(rootEl);
root.render(<App />);

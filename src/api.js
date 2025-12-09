// FRONT-END/src/api.js
import axios from "axios";

export const API = axios.create({
  baseURL: "https://fitness-tracker-backend-v5jh.onrender.com", // <-- backend URL (must be exactly this)
  headers: {
    "Content-Type": "application/json"
  }
});

export async function post(path, body) {
  try {
    const res = await API.post(path, body);
    return { status: res.status, data: res.data };
  } catch (err) {
    // If server returned an HTTP error response, surface that
    if (err.response) {
      return { status: err.response.status, data: err.response.data };
    }
    // Network / CORS / other failure
    return { status: 0, data: { error: "Network error" } };
  }
}

// FRONT-END/src/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

console.log("API BASE URL =>", baseURL); // for debugging

export const API = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function post(path, body) {
  try {
    const res = await API.post(path, body);
    return { status: res.status, data: res.data };
  } catch (err) {
    if (err.response) {
      return { status: err.response.status, data: err.response.data };
    }
    return { status: 0, data: { error: "Network error" } };
  }
}

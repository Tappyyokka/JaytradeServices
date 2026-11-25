const configuredUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
const API_BASE_URL = configuredUrl || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default API_BASE_URL;

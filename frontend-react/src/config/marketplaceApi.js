import API_BASE_URL from "./api";

export default async function marketplaceRequest(path, method = "GET", body) {
  if (!API_BASE_URL) {
    throw new Error("Marketplace API is not configured. Set VITE_API_URL to the backend URL and rebuild the frontend.");
  }
  const response = await fetch(`${API_BASE_URL}/api/marketplace${path}`, {
    method,
    credentials: "include",
    headers: {
      "X-Indipay-Marketplace": "1",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    if (response.status === 404) {
      throw new Error("The running backend does not expose this Marketplace endpoint. Restart or deploy the latest backend.");
    }
    throw new Error(`Marketplace API returned an unexpected response (HTTP ${response.status}). Check that VITE_API_URL points to the backend.`);
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Marketplace request failed.");
  return result;
}

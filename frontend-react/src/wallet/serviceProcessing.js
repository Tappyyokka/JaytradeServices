import API_BASE_URL from "../config/api";

export async function serviceProcessingRequest(path, { signal, file } = {}) {
  const response = await fetch(API_BASE_URL + "/api/service-processing" + path, {
    credentials: "include",
    signal,
    ...(file && {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "X-Indipay-Service-Document": "1",
        "X-Document-Name": encodeURIComponent(file.name),
      },
      body: file,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(
    new Error(data.message ?? "Service processing is currently unavailable."), { status: response.status },
  );
  return data;
}

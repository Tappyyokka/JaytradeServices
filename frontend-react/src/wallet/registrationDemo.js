import API_BASE_URL from "../config/api";

export const demoRegistrationBase = `${API_BASE_URL}/api/registration-demo`;

export async function registrationRequest(path, body, signal) {
  const response = await fetch(demoRegistrationBase + path, {
    credentials: "include",
    signal,
    ...(body && {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Indipay-Registration": "demo" },
      body: JSON.stringify(body),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.demo !== true) throw Object.assign(
    new Error(data.message ?? "The registration demo is unavailable."),
    { status: response.status },
  );
  return data;
}

export const registrationSteps = ["Enquired", "In Review", "Enquiry Verification", "Primary Approval", "Register My Application"];

export function registrationProgress(application, jaytrade, registered) {
  if (registered || jaytrade?.registration?.paid === true) return { currentStep: 4, rejected: false };
  const status = String(jaytrade?.status ?? "").toLowerCase();
  const rejected = /reject|\blost\b/.test(status) || /reject/.test(jaytrade?.customer_status?.toLowerCase() ?? "");
  const explicit = { enquired: 0, review: 1, verification: 2, primary_approval: 3 };
  const stage = jaytrade?.registration?.stage;
  if (Object.hasOwn(explicit, stage)) return { currentStep: explicit[stage], rejected };
  if (application.leadSyncStatus !== "SYNCED") return { currentStep: 0, rejected };
  if (/verif|approved|complete|quick action|converted/.test(status)) return { currentStep: 2, rejected };
  return { currentStep: /review|process|assign|follow.up|positive/.test(status) ? 1 : 0, rejected };
}

export const applicationRegistrationPath = (id) => "/applications/" + encodeURIComponent(id);

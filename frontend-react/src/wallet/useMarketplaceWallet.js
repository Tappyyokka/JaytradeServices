import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import API from "../config/api";
import { accountWallet } from "./walletData";

export default function useMarketplaceWallet(customer) {
  const customerId = customer?.id;
  const sequence = useRef(0);
  const pending = useRef(null);
  const [result, setResult] = useState(null);
  const refresh = useCallback(async () => {
    if (!customerId) return;
    const controller = new AbortController();
    pending.current?.abort();
    pending.current = controller;
    const requestId = ++sequence.current;
    try {
      const response = await fetch(API + "/api/customer-money", { credentials: "include", signal: controller.signal });
      if (!response.ok) throw new Error("Customer Money is temporarily unavailable.");
      const account = await response.json();
      if (sequence.current === requestId) setResult({ customerId, account, error: "" });
    } catch (error) {
      if (!controller.signal.aborted && sequence.current === requestId) {
        setResult((previous) => ({
          customerId, account: previous?.customerId === customerId ? previous.account : null, error: error.message,
        }));
      }
    } finally { if (pending.current === controller) pending.current = null; }
  }, [customerId]);

  useEffect(() => {
    void refresh();
    return () => { sequence.current += 1; pending.current?.abort(); };
  }, [refresh]);

  useEffect(() => {
    if (!customerId) return undefined;
    const refreshVisible = () => { if (!pending.current && document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    const timer = window.setInterval(refreshVisible, 60_000);
    return () => {
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.clearInterval(timer);
    };
  }, [customerId, refresh]);

  const current = customerId && result?.customerId === customerId ? result : null;
  const account = current?.account ?? null;
  return {
    account,
    wallet: useMemo(() => accountWallet(account, customer), [account, customer]),
    error: current?.error ?? "",
    loading: Boolean(customerId && !current),
    refresh,
  };
}

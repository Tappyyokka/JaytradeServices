import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import marketplaceRequest from "../config/marketplaceApi";
import { accountWallet } from "./walletData";

export default function useMarketplaceWallet(customer) {
  const customerId = customer?.id;
  const sequence = useRef(0);
  const [result, setResult] = useState(null);
  const refresh = useCallback(async () => {
    if (!customerId) return;
    const requestId = ++sequence.current;
    try {
      const account = await marketplaceRequest("/account");
      if (sequence.current === requestId) setResult({ customerId, account, error: "" });
    } catch (error) {
      if (sequence.current === requestId) {
        setResult((previous) => ({
          customerId, account: previous?.customerId === customerId ? previous.account : null, error: error.message,
        }));
      }
    }
  }, [customerId]);

  useEffect(() => {
    void refresh();
    return () => { sequence.current += 1; };
  }, [refresh]);

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

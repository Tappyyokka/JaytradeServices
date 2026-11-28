import { useEffect, useRef, useState } from "react";
import marketplaceRequest from "../../config/marketplaceApi";

export default function useSuperstoreSocial(customerId, saved, followed) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const oldSaved = useRef(saved);
  const oldFollowed = useRef(followed);

  useEffect(() => {
    if (!customerId) return;
    let active = true;
    async function load() {
      try {
        const keys = oldSaved.current.filter((id) => typeof id === "string" && id.length > 0 && id.length <= 140);
        for (let start = 0; start < keys.length && active; start += 250) {
          await marketplaceRequest("/social/wishlist/import", "POST", { keys: keys.slice(start, start + 250) });
        }
        const stores = oldFollowed.current.filter((id) => typeof id === "string" && id.startsWith("live-") && id.length > 5 && id.length < 145)
          .map((id) => id.slice(5));
        for (let start = 0; start < stores.length && active; start += 250) {
          await marketplaceRequest("/social/follows/import", "POST", { stores: stores.slice(start, start + 250) });
        }
        if (!active) return;
        const data = await marketplaceRequest("/social");
        if (active) setResult({ customerId, data });
      } catch (failure) {
        if (active) setError(failure.message);
      }
    }
    void load();
    return () => { active = false; };
  }, [customerId]);

  async function change(path, method, body) {
    if (!customerId || pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = path ? await marketplaceRequest(path, method, body) : true;
      setResult({ customerId, data: await marketplaceRequest("/social") });
      return response;
    } catch (failure) { setError(failure.message); return false; }
    finally { pending.current = false; setBusy(false); }
  }

  return { data: result?.customerId === customerId ? result?.data : null, error, busy, change, refresh: () => change() };
}

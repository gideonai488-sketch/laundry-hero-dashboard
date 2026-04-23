import { useEffect, useState } from "react";

/**
 * Mock offline detector. Listens to navigator online/offline events and exposes
 * a "queued actions" counter that increments while offline and clears when back.
 */
export function useOfflineQueue() {
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOnline(navigator.onLine);
    const onUp = () => { setOnline(true); setQueued(0); };
    const onDown = () => setOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  // While offline, simulate the merchant taking actions every 6s
  useEffect(() => {
    if (online) return;
    const id = setInterval(() => setQueued((q) => q + 1), 6000);
    return () => clearInterval(id);
  }, [online]);

  return { online, queued };
}

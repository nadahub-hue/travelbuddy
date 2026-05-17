import { useEffect } from "react";
import { useSelector } from "react-redux";

const SERVER = "http://localhost:7500";
const HEARTBEAT_MS = 30 * 1000; // ping every 30s while tab is visible

/**
 * Keeps the logged-in user's online status fresh on the server.
 * - Sends an immediate "online" ping when a user is logged in.
 * - Re-pings every 30s while the tab is visible.
 * - Pauses pings when the tab is hidden (browser throttles intervals anyway).
 * - Marks the user offline on tab close/refresh via sendBeacon (survives unload).
 * - Marks offline when the user logs out (i.e. when `currentUser` becomes null).
 *
 * Mount this once at the app root.
 */
export default function useOnlinePresence() {
  const currentUser = useSelector((state) => state.user.user);
  const userId = currentUser?._id ? String(currentUser._id) : null;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const setStatus = (isOnline) => {
      if (cancelled) return;
      fetch(`${SERVER}/users/online/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline }),
        keepalive: true, // allows the request to outlive the page if needed
      }).catch(() => {});
    };

    // sendBeacon is the only request type guaranteed to fire during unload.
    const sendOfflineBeacon = () => {
      try {
        const url = `${SERVER}/users/online/offline-beacon/${userId}`;
        const blob = new Blob([JSON.stringify({ isOnline: false })], {
          type: "application/json",
        });
        // Prefer beacon; fall back to keepalive fetch.
        if (navigator.sendBeacon && navigator.sendBeacon(url, blob)) return;
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOnline: false }),
          keepalive: true,
        }).catch(() => {});
      } catch (_) {}
    };

    // Initial online ping
    setStatus(true);

    // Heartbeat
    const heartbeat = setInterval(() => {
      if (document.visibilityState === "visible") {
        setStatus(true);
      }
    }, HEARTBEAT_MS);

    // Re-ping when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setStatus(true);
      } else {
        setStatus(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Best-effort offline on tab close/refresh/navigate-away
    const onUnload = () => sendOfflineBeacon();
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      cancelled = true;
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
      // Logged out or component unmounting → mark offline.
      setStatus(false);
    };
  }, [userId]);
}

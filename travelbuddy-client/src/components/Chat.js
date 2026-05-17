import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "./ThemeContext";
 
import profileIcon from "../images/user (1).png";
 
const SERVER = "http://localhost:7500";
const MESSAGES_POLL_MS = 1500;   // how often to refresh active chat
const SIDEBAR_POLL_MS  = 3000;   // how often to refresh conversation list
 
export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { theme } = useTheme();
  const isDark = theme === "dark";

  

  // Centralized color palette so the rest of the JSX stays clean.
  const C = isDark ? {
    pageBg:       "#15101c",
    sidebarBg:    "#1e1929",
    chatBg:       "#15101c",
    headerBg:     "#1e1929",
    panelBg:      "#1f1929",
    bookingBg:    "#231833",
    border:       "#2e2440",
    borderSoft:   "#251c33",
    activeBg:     "#2a2238",
    activeBorder: "#7b3fc4",
    text:         "#e8e8ec",
    textMuted:    "#a8a4b3",
    textFaint:    "#6a6678",
    textHeading:  "#cbb7f5",
    bubbleMine:   "#5a28c8",
    bubbleTheirs: "#27212e",
    bubbleTheirsText: "#e8e8ec",
    inputBg:      "#232028",
    inputBorder:  "#3a3349",
    micRest:      "#27212e",
    micBorder:    "#7b3fc4",
    micText:      "#cbb7f5",
    sendBtn:      "#7b3fc4",
    shadow:       "0 1px 4px rgba(0,0,0,0.4)",
  } : {
    pageBg:       "#f0eef8",
    sidebarBg:    "#ffffff",
    chatBg:       "#f0eef8",
    headerBg:     "#ffffff",
    panelBg:      "#ffffff",
    bookingBg:    "#f9f4ff",
    border:       "#e0d8f0",
    borderSoft:   "#f5f0fb",
    activeBg:     "#f3ecff",
    activeBorder: "#4b1a9a",
    text:         "#222",
    textMuted:    "#888",
    textFaint:    "#bbb",
    textHeading:  "#3c175a",
    bubbleMine:   "#4b1a9a",
    bubbleTheirs: "#ffffff",
    bubbleTheirsText: "#222",
    inputBg:      "#f8f5ff",
    inputBorder:  "#e0d8f0",
    micRest:      "#f8f5ff",
    micBorder:    "#4b1a9a",
    micText:      "#4b1a9a",
    sendBtn:      "#4b1a9a",
    shadow:       "0 1px 4px rgba(0,0,0,0.05)",
  };

  const currentUser = useSelector((state) => state.user.user);
  const navState = location.state || {};
  const myId = String(navState.senderId || currentUser?._id || "");
  const myEmail = navState.senderEmail || currentUser?.userEmail || "";
 
  const isTripOwner = !navState.tripOwnerId || String(myId) === String(navState.tripOwnerId);
 
 
  // Booking panel state
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [myTrips, setMyTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookingMsgType, setBookingMsgType] = useState("");
  const [bookingCreated, setBookingCreated] = useState(null);
 
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineStatus, setOnlineStatus] = useState({});
 
  const messagesEndRef = useRef(null);
  const activeConvRef = useRef(null);
  const recognitionRef = useRef(null);
  const messageBaseRef = useRef("");
 
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState("");
 
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);
 
  /* ── Voice-to-text (Web Speech API) ── */
  // Refs to track final transcript across continuous-mode auto-restarts
  const finalTranscriptRef = useRef("");
  const manuallyStoppedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[Voice] SpeechRecognition not supported in this browser.");
      return;
    }

    // Web Speech API requires a secure context (HTTPS) or localhost.
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      console.warn(
        "[Voice] Speech recognition requires HTTPS or localhost. Current origin:",
        window.location.origin
      );
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Force a stable language — navigator.language can be a locale Speech API
    // does not support, which causes the engine to start but never return results.
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("[Voice] Started listening");
      setIsListening(true);
      setSpeechError("");
    };

    recognition.onaudiostart = () => console.log("[Voice] Audio capture started");
    recognition.onspeechstart = () => console.log("[Voice] Speech detected");
    recognition.onspeechend = () => console.log("[Voice] Speech ended");

    recognition.onend = () => {
      console.log("[Voice] Recognition ended. Manual stop?", manuallyStoppedRef.current);
      // Chrome auto-stops the recognizer after a few seconds of silence even
      // when continuous: true. If the user didn't press stop, restart it.
      if (!manuallyStoppedRef.current) {
        try {
          recognition.start();
          return;
        } catch (e) {
          console.warn("[Voice] Auto-restart failed:", e);
        }
      }
      setIsListening(false);
      manuallyStoppedRef.current = false;
    };

    recognition.onerror = (event) => {
      console.error("[Voice] Error:", event.error, event);
      manuallyStoppedRef.current = true;
      setIsListening(false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setSpeechError(
          "Microphone access denied. Allow mic in browser settings, then click the mic again."
        );
      } else if (event.error === "no-speech") {
        setSpeechError("No speech detected. Try again.");
      } else if (event.error === "audio-capture") {
        setSpeechError("No microphone found. Please check your mic.");
      } else if (event.error === "network") {
        setSpeechError("Network error. Speech recognition needs internet.");
      } else if (event.error !== "aborted") {
        setSpeechError("Voice input failed: " + event.error);
      }
    };

    recognition.onresult = (event) => {
      // Track final results separately so auto-restart doesn't duplicate them.
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interim += transcript;
        }
      }
      const base = messageBaseRef.current;
      const combined = (base + finalTranscriptRef.current + interim).replace(/\s+/g, " ").trimStart();
      console.log("[Voice] Result →", combined);
      setNewMessage(combined);
    };

    recognitionRef.current = recognition;

    return () => {
      manuallyStoppedRef.current = true;
      try {
        recognition.abort();
      } catch (_) {}
    };
  }, []);

  const toggleVoiceInput = async () => {
    const recognition = recognitionRef.current;
    if (!recognition || !activeConv) return;

    if (isListening) {
      manuallyStoppedRef.current = true;
      try { recognition.stop(); } catch (_) {}
      return;
    }

    // Proactively request microphone permission so the user sees a clear prompt
    // instead of a silent failure if permission has been blocked before.
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.error("[Voice] getUserMedia failed:", err);
        setSpeechError(
          "Microphone access denied. Click the lock icon in the address bar and allow microphone."
        );
        return;
      }
    }

    setSpeechError("");
    finalTranscriptRef.current = "";
    messageBaseRef.current = newMessage ? newMessage + " " : "";
    manuallyStoppedRef.current = false;

    try {
      recognition.start();
    } catch (err) {
      console.warn("[Voice] start() threw, retrying after abort:", err);
      try {
        recognition.abort();
        setTimeout(() => {
          try { recognition.start(); }
          catch (e) {
            console.error("[Voice] start retry failed:", e);
            setSpeechError("Could not start microphone. Try refreshing the page.");
          }
        }, 200);
      } catch (e) {
        setSpeechError("Could not start microphone.");
      }
    }
  };
 
  /* ── Helper: fetch + merge sidebar conversations ── */
  const refreshConversations = useCallback(() => {
    if (!myId) return;
    fetch(`${SERVER}/chat/conversations/${myId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setConversations(data.conversations || []);
          setActiveConv((prev) => {
            if (!prev) return prev;
            const updated = (data.conversations || []).find(
              (c) => String(c.otherId) === String(prev.otherId)
            );
            return updated
              ? { ...prev, otherName: updated.otherName, otherEmail: updated.otherEmail }
              : prev;
          });
        }
      })
      .catch(() => {});
  }, [myId]);
 
 
  /* ── Helper: fetch messages for active conversation ── */
  const refreshMessages = useCallback(() => {
    const conv = activeConvRef.current;
    if (!conv || !myId) return;
    fetch(`${SERVER}/chat/${myId}/${conv.otherId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.chat) {
          setMessages(
            data.chat.map((m) => ({
              id: m._id,
              sender: String(m.senderId),
              text: m.text,
              isRead: m.isRead,
              time: new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
          );
        }
      })
      .catch(() => {});
  }, [myId]);
 
  /* ── Initial load: sidebar + incoming nav conversation ── */
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);
 
  useEffect(() => {
    if (!navState.receiverId) return;
    const incoming = {
      otherId: String(navState.receiverId),
      otherName: navState.receiverName || "Companion",
      otherEmail: navState.receiverEmail || "",
      fromLocation: navState.fromLocation || "",
      toLocation: navState.toLocation || "",
      fare: navState.fare || 0,
      lastMessage: "",
    };
    setConversations((prev) => {
      const exists = prev.find((c) => c.otherId === String(navState.receiverId));
      return exists ? prev : [incoming, ...prev];
    });
    setActiveConv(incoming);
    setMessages([]);
  }, [navState.receiverId]);
 
  /* ── Polling: sidebar every 3 s ── */
  useEffect(() => {
    if (!myId) return;
    const id = setInterval(refreshConversations, SIDEBAR_POLL_MS);
    return () => clearInterval(id);
  }, [myId, refreshConversations]);
 
 
  /* ── Polling: messages every 1.5 s when a conversation is open ── */
  useEffect(() => {
    if (!activeConv || !myId) return;
    refreshMessages(); // immediate first load
    const id = setInterval(refreshMessages, MESSAGES_POLL_MS);
    return () => clearInterval(id);
  }, [activeConv?.otherId, myId, refreshMessages]);

  /* ── Online status: heartbeat + sidebar polling ── */
  // 1) Mark *me* as online every 25s while this page is mounted, and mark
  //    offline when leaving the page or closing the tab.
  useEffect(() => {
    if (!myId) return;

    const sendStatus = (isOnline) => {
      fetch(`${SERVER}/users/online/${myId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline }),
        keepalive: true,
      }).catch(() => {});
    };

    sendStatus(true);
    const heartbeat = setInterval(() => sendStatus(true), 25 * 1000);

    const onUnload = () => {
      try {
        const url = `${SERVER}/users/online/${myId}`;
        const blob = new Blob([JSON.stringify({ isOnline: false })], {
          type: "application/json",
        });
        // sendBeacon survives page unload better than fetch.
        if (navigator.sendBeacon) navigator.sendBeacon(url, blob);
        else sendStatus(false);
      } catch (_) {}
    };
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
      sendStatus(false);
    };
  }, [myId]);

  // 2) Poll every 8s for the online status of every user in the sidebar so
  //    the green/grey dots stay live without clicking each conversation.
  useEffect(() => {
    if (!myId) return;
    const ids = conversations.map((c) => c.otherId).filter(Boolean);
    if (ids.length === 0) return;

    let cancelled = false;
    const fetchAll = () => {
      Promise.all(
        ids.map((id) =>
          fetch(`${SERVER}/users/online/${id}`)
            .then((r) => r.json())
            .then((data) => ({ id, isOnline: !!(data.flag && data.isOnline) }))
            .catch(() => ({ id, isOnline: false }))
        )
      ).then((results) => {
        if (cancelled) return;
        setOnlineStatus((prev) => {
          const next = { ...prev };
          results.forEach(({ id, isOnline }) => { next[id] = isOnline; });
          return next;
        });
      });
    };

    fetchAll();
    const id = setInterval(fetchAll, 8 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [myId, conversations]);
 
 
  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    setMessages([]);
    fetch(`${SERVER}/chat/read/${myId}/${conv.otherId}`, { method: "PATCH" }).catch(() => {});
    fetch(`${SERVER}/users/online/${conv.otherId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.flag) {
          setOnlineStatus((prev) => ({ ...prev, [conv.otherId]: data.isOnline }));
        }
      })
      .catch(() => {});
  };
 
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      manuallyStoppedRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  }, [activeConv?.otherId]);
 
  const handleSend = useCallback(() => {
    const conv = activeConvRef.current;
    if (!newMessage.trim() || !conv || !myId) return;
 
    if (isListening && recognitionRef.current) {
      manuallyStoppedRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
 
    const text = newMessage.trim();
    setNewMessage("");
 
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: String(myId), text, time },
    ]);
 
    fetch(`${SERVER}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: myId, receiverId: conv.otherId, text }),
    }).catch(() => {});
 
    setConversations((prev) =>
      prev.map((c) =>
        c.otherId === conv.otherId ? { ...c, lastMessage: text } : c
      )
    );
  }, [myId, newMessage, isListening]);
 
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };
 
  return (
    <>
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 82px)",
        backgroundColor: C.pageBg,
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar ── */}
      <div
        style={{
          width: "300px",
          minWidth: "300px",
          backgroundColor: C.sidebarBg,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 18px 14px",
            borderBottom: `1px solid ${C.border}`,
            fontWeight: 700,
            fontSize: "1.15rem",
            color: C.textHeading,
          }}
        >
          💬 Conversations
        </div>
 
        <div style={{ overflowY: "auto", flex: 1 }}>
          {conversations.length === 0 ? (
            <div
              style={{
                padding: "30px 18px",
                color: C.textMuted,
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              No conversations yet.
              <br />
              Find a companion from <strong>Search</strong> to start chatting.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConv?.otherId === conv.otherId;
              return (
                <div
                  key={conv.otherId}
                  onClick={() => handleSelectConv(conv)}
                  style={{
                    padding: "14px 16px",
                    cursor: "pointer",
                    backgroundColor: isActive ? C.activeBg : "transparent",
                    borderLeft: isActive
                      ? `4px solid ${C.activeBorder}`
                      : "4px solid transparent",
                    borderBottom: `1px solid ${C.borderSoft}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <img
                      src={profileIcon}
                      alt="User"
                      style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <span style={{
                      position: "absolute", bottom: 1, right: 1,
                      width: 11, height: 11, borderRadius: "50%",
                      background: onlineStatus[conv.otherId] ? "#4caf50" : (isDark ? "#555" : "#bbb"),
                      border: `2px solid ${C.sidebarBg}`,
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: C.textHeading,
                        fontSize: "0.95rem",
                        marginBottom: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {conv.otherName}
                    </div>
                    {conv.fromLocation && conv.toLocation && (
                      <div
                        style={{
                          fontSize: "0.76rem",
                          color: C.textMuted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {conv.fromLocation} → {conv.toLocation}
                      </div>
                    )}
                    {conv.lastMessage && (
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: C.textFaint,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginTop: "2px",
                        }}
                      >
                        {conv.lastMessage}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
 
      {/* ── Chat window ── */}
      {activeConv ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div
            style={{
              backgroundColor: C.headerBg,
              padding: "14px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxShadow: C.shadow,
            }}
          >
            <img
              src={profileIcon}
              alt="User"
              style={{ width: "46px", height: "46px", borderRadius: "50%" }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: C.textHeading, display: "flex", alignItems: "center", gap: 8 }}>
                {activeConv.otherName}
                <span style={{
                  fontSize: "0.72rem", fontWeight: 600,
                  color: onlineStatus[activeConv.otherId] ? "#4caf50" : C.textMuted,
                }}>
                  {onlineStatus[activeConv.otherId] ? "● Online" : "● Offline"}
                </span>
              </div>
              {activeConv.fromLocation && activeConv.toLocation && (
                <div style={{ fontSize: "0.83rem", color: C.textMuted }}>
                  {activeConv.fromLocation} → {activeConv.toLocation}
                  {activeConv.fare ? ` · ${activeConv.fare} OMR` : ""}
                </div>
              )}
            </div>
 
            {isTripOwner ? (
              <button
                onClick={async () => {
                setBookingMsg(""); setBookingCreated(null);
                setShowBookingPanel((v) => {
                  if (v) { setMyTrips([]); setSelectedTripId(""); }
                  return !v;
                });
                if (!showBookingPanel && myTrips.length === 0) {
                    try {
                      const ownerId = currentUser?._id || myId;
                      const res = await fetch(`${SERVER}/trips/owner/${ownerId}`);
                      const data = await res.json();
                      setMyTrips(data.trips || []);
                      if (data.trips?.length > 0) setSelectedTripId(data.trips[0]._id);
                    } catch (_) {}
                  }
                }}
                style={{
                  marginLeft: "auto",
                  border: "none",
                  backgroundColor: showBookingPanel ? "#6a1b9a" : "#28a745",
                  color: "#fff",
                  padding: "10px 22px",
                  borderRadius: "22px",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {showBookingPanel ? "✕ Cancel" : "Book Ride"}
              </button>
            ) : null}
          </div>
 
          {/* ── Booking Panel ── */}
          {showBookingPanel && (
            <div style={{
              backgroundColor: C.bookingBg,
              borderBottom: `1px solid ${C.border}`,
              padding: "18px 24px",
            }}>
              {bookingCreated ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: isDark ? "#7fcf86" : "#2e7d32", fontWeight: 700, fontSize: "1rem", marginBottom: "6px" }}>
                    ✅ Booking sent! Waiting for a driver to accept and set the fare.
                  </div>
                  <div style={{ color: C.textMuted, fontSize: "0.88rem" }}>
                    You will be notified once a driver accepts. Check <b>My Bookings</b> to pay after the driver is assigned.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 700, color: C.textHeading, marginBottom: "12px" }}>
                    Start Booking with <span style={{ color: isDark ? "#d4b3f5" : "#7b1fa2" }}>{activeConv.otherName}</span>
                  </div>
 
                  {myTrips.length === 0 ? (
                    <div style={{ color: C.textMuted, fontSize: "0.9rem" }}>
                      You have no posted trips. Go to{" "}
                      <span
                        onClick={() => navigate("/search")}
                        style={{ color: isDark ? "#d4b3f5" : "#7b1fa2", cursor: "pointer", fontWeight: 600 }}
                      >
                        Search
                      </span>{" "}
                      and post a trip first.
                    </div>
                  ) : (
                    <>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: C.textMuted, display: "block", marginBottom: "6px" }}>
                        Select your trip:
                      </label>
                      <select
                        value={selectedTripId}
                        onChange={(e) => setSelectedTripId(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 14px",
                          borderRadius: "10px", border: `1px solid ${isDark ? "#3a3349" : "#c4a8e8"}`,
                          fontSize: "0.9rem", marginBottom: "12px",
                          backgroundColor: isDark ? "#232028" : "#fff", color: C.text,
                        }}
                      >
                        {myTrips.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.fromLocation} → {t.toLocation} &nbsp;|&nbsp;
                            {new Date(t.travelDate).toLocaleDateString()} &nbsp;|&nbsp;
                            OMR {t.estimatedFare}
                          </option>
                        ))}
                      </select>
 
                      <button
                        onClick={async () => {
                          if (!selectedTripId) return;
                          setBookingMsg("Creating booking…");
                          setBookingMsgType("info");
                          try {
                            const trip = myTrips.find((t) => t._id === selectedTripId);
                            const companionEmail = activeConv.otherEmail || "";
                            const res = await fetch(`${SERVER}/confirmBooking`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                tripId: selectedTripId,
                                participantEmails: [myEmail, companionEmail].filter(Boolean),
                                totalFare: 0,
                                farePerPerson: 0,
                              }),
                            });
                            const data = await res.json();
                            if (data.booking) {
                              setBookingCreated(data.booking);
                              setBookingMsg("");
                            } else {
                              setBookingMsg(data.serverMsg || "Failed to create booking.");
                              setBookingMsgType("error");
                            }
                          } catch (_) {
                            setBookingMsg("Server error. Please try again.");
                            setBookingMsgType("error");
                          }
                        }}
                        style={{
                          background: "#7b1fa2", color: "#fff", border: "none",
                          borderRadius: "20px", padding: "10px 28px",
                          fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
                        }}
                      >
                        Confirm &amp; Add {activeConv.otherName}
                      </button>
 
                      {bookingMsg && (
                        <div style={{
                          marginTop: "10px", fontSize: "0.88rem", fontWeight: 600,
                          color: bookingMsgType === "error" ? "#c00" : "#555",
                        }}>{bookingMsg}</div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
 
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "22px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: C.textFaint,
                  fontSize: "0.95rem",
                  marginTop: "40px",
                }}
              >
                No messages yet. Say hello!
              </div>
            )}
 
            {messages.map((msg) => {
              const isMe = String(msg.sender) === String(myId);
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "65%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isMe ? C.bubbleMine : C.bubbleTheirs,
                        color: isMe ? "#ffffff" : C.bubbleTheirsText,
                        padding: "11px 16px",
                        borderRadius: isMe
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        fontSize: "0.97rem",
                        lineHeight: "1.45",
                        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.07)",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                    </div>
                    <span
                      style={{
                        marginTop: "4px",
                        fontSize: "0.74rem",
                        color: C.textFaint,
                        padding: "0 4px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {msg.time}
                      {isMe && (
                        <span style={{ color: msg.isRead ? (isDark ? "#cbb7f5" : "#4b1a9a") : C.textFaint, fontWeight: 700 }}>
                          {msg.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
 
            <div ref={messagesEndRef} />
          </div>
 
          {/* Input bar */}
          <div style={{ backgroundColor: C.headerBg, borderTop: `1px solid ${C.border}` }}>
            {isListening && (
              <div
                style={{
                  padding: "8px 20px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#c62828",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <span className="mic-pulse-dot" />
                Listening… speak now
              </div>
            )}
            {speechError && (
              <div style={{ padding: "8px 20px 0", fontSize: "0.82rem", color: "#c62828", fontWeight: 600 }}>
                {speechError}
              </div>
            )}
            <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={!speechSupported}
                title={
                  !speechSupported
                    ? "Voice input not supported in this browser (use Chrome or Edge)"
                    : isListening
                    ? "Stop listening"
                    : "Voice to text"
                }
                className={isListening ? "mic-btn mic-btn-listening" : "mic-btn"}
                style={{
                  border: isListening ? "none" : `2px solid ${C.micBorder}`,
                  backgroundColor: isListening ? "#e53935" : C.micRest,
                  color: isListening ? "#fff" : C.micText,
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  fontSize: "1.35rem",
                  cursor: speechSupported ? "pointer" : "not-allowed",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                  opacity: speechSupported ? 1 : 0.45,
                }}
              >
                {isListening ? "⏹" : "🎤"}
              </button>
              <input
                type="text"
                placeholder={isListening ? "Listening…" : "Write a message..."}
                value={newMessage}
                onChange={(e) => {
                  if (!isListening) setNewMessage(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                readOnly={isListening}
                style={{
                  flex: 1,
                  border: isListening ? "2px solid #e53935" : `1px solid ${C.inputBorder}`,
                  borderRadius: "30px",
                  padding: "12px 20px",
                  fontSize: "1rem",
                  outline: "none",
                  backgroundColor: isListening ? (isDark ? "#3a1d1d" : "#fff5f5") : C.inputBg,
                  color: C.text,
                  boxShadow: isListening ? "0 0 0 3px rgba(229,57,53,0.15)" : "none",
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isListening}
                style={{
                  border: "none",
                  backgroundColor: isListening ? "#aaa" : C.sendBtn,
                  color: "#fff",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  fontSize: "1.3rem",
                  cursor: isListening ? "not-allowed" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: C.textFaint,
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "4rem" }}>💬</div>
          <p style={{ fontSize: "1.1rem", color: C.textMuted }}>
            Select a conversation to start chatting
          </p>
        </div>
      )}
    </div>
 
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.03); }
      }
      @keyframes mic-pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.5); }
        50% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(229, 57, 53, 0); }
      }
      .mic-btn-listening {
        animation: mic-pulse 1.2s ease-in-out infinite;
      }
      .mic-pulse-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #e53935;
        animation: mic-pulse 1.2s ease-in-out infinite;
        flex-shrink: 0;
      }
    `}</style>
    </>
  );
}

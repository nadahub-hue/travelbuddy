import { Container } from "reactstrap";
import { useState, useRef, useEffect } from "react";
import maleIcon from "../images/male.png";
import femaleIcon from "../images/female.png";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "female",
      text: "Hi! Are you going to Muscat today?",
      time: "10:00 AM",
    },
    {
      id: 2,
      sender: "male",
      text: "Yes, I’m leaving at 3:00 PM.",
      time: "10:02 AM",
    },
    {
      id: 3,
      sender: "female",
      text: "Great, can I join the trip?",
      time: "10:03 AM",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: "male", // current user
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container
      fluid
      className="p-0"
      style={{
        backgroundColor: "#f5f5f5",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "18px 30px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <img
          src={maleIcon}
          alt="Male"
          style={{
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <img
          src={femaleIcon}
          alt="Female"
          style={{
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "25px 20px 120px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {messages.map((msg) => {
          const isCurrentUser = msg.sender === "male";

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isCurrentUser ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isCurrentUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    backgroundColor: isCurrentUser ? "#4b1a9a" : "#ffffff",
                    color: isCurrentUser ? "#ffffff" : "#222",
                    padding: "12px 18px",
                    borderRadius: isCurrentUser
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    fontSize: "1rem",
                    lineHeight: "1.4",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>

                <span
                  style={{
                    marginTop: "5px",
                    fontSize: "0.8rem",
                    color: "#777",
                    padding: "0 6px",
                  }}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "900px",
          backgroundColor: "#ffffff",
          borderRadius: "40px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          padding: "10px 14px 10px 22px",
        }}
      >
        <input
          type="text"
          placeholder="Write message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "1.1rem",
            backgroundColor: "transparent",
            color: "#333",
          }}
        />

        <button
          onClick={handleSend}
          style={{
            border: "none",
            backgroundColor: "#f4b400",
            color: "#fff",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            fontSize: "1.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: "10px",
          }}
        >
          ➤
        </button>
      </div>
    </Container>
  );
}
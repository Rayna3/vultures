import React, { useState, useRef, useEffect } from "react";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const endpoint =
    "https://us-central1-vultures-b5e31.cloudfunctions.net/fridgeBot";

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setInput("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { from: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { from: "bot", text: "Error sending message." }]);
    }
  };

  return (
    <div style={styles.chatBoxContainer}>
      <div style={styles.messagesContainer}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={
              m.from === "user"
                ? styles.userBubbleContainer
                : styles.botBubbleContainer
            }
          >
            <div
              style={
                m.from === "user"
                  ? styles.userBubble
                  : styles.botBubble
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask FridgeBot..."
          style={styles.inputField}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button onClick={send} style={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  chatBoxContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "600px",
    height: "400px",
    margin: "0 auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },
  messagesContainer: {
    flexGrow: 1,
    padding: "10px",
    backgroundColor: "#f9f9f9",
    overflowY: "auto",
  },
  userBubbleContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "8px",
  },
  botBubbleContainer: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "8px",
  },
  userBubble: {
    backgroundColor: "#DCF8C6",
    color: "#000",
    padding: "8px 12px",
    borderRadius: "16px",
    maxWidth: "75%",
    lineHeight: "1.4",
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    color: "#000",
    padding: "8px 12px",
    borderRadius: "16px",
    maxWidth: "75%",
    lineHeight: "1.4",
    border: "1px solid #e0e0e0",
  },
  inputContainer: {
    display: "flex",
    borderTop: "1px solid #ccc",
    padding: "8px",
    backgroundColor: "#fff",
  },
  inputField: {
    flexGrow: 1,
    padding: "8px",
    borderRadius: "16px",
    border: "1px solid #ccc",
    marginRight: "8px",
    outline: "none",
    fontSize: "14px",
  },
  sendButton: {
    padding: "8px 16px",
    borderRadius: "16px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
};

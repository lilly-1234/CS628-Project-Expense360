import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "User", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setInput("");

    try {
      const response = await axios.post("https://special-eureka-r9px5jx6wg6fprx9-5000.app.github.dev/api/chat", { message: input }, { headers: { "Content-Type": "application/json" }});

      console.log("Response from backend:", response.data);

      const botMessage = { sender: "Bot", text: response.data.reply || "No response from bot." };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prevMessages) => [...prevMessages, { sender: "Bot", text: "Error: Unable to connect." }]);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center", 
      width: "100vw", 
      height: "100vh", 
      background: "#f4f4f4",
      padding: "20px"
    }}>
      <div style={{ 
        width: "60%", 
        height: "60vh", 
        overflowY: "auto", 
        border: "1px solid #ddd", 
        padding: "10px", 
        background: "#fff",
        marginBottom: "10px"
      }}>
        {messages.map((msg, index) => (
          <p key={index} style={{ textAlign: msg.sender === "User" ? "right" : "left" }}>
            <strong>{msg.sender}: </strong>{msg.text}
          </p>
        ))}
      </div>
      <div style={{ display: "flex", width: "60%" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
          style={{ flexGrow: 1, padding: "8px" }}
        />
        <button onClick={sendMessage} style={{ marginLeft: "10px", padding: "8px 15px" }}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;

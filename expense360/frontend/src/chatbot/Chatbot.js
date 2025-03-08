import React, { useState } from "react";
import "./Chatbot.css"; 
import { CHATBOT_API } from "../api.js"; 

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "User", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(CHATBOT_API, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let botResponse = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const cleanChunk = chunk.replace(/^data:\s*/, ''); 

          if (cleanChunk.trim() === "[DONE]") {
            break; 
          }

          try {
            const jsonResponse = JSON.parse(cleanChunk);
            botResponse += jsonResponse.response; 
            setMessages((prevMessages) => {
              const updatedMessages = prevMessages.filter((msg) => msg.sender !== "Bot");
              return [...updatedMessages, { sender: "Bot", text: botResponse }];
            });
          } catch (error) {
            console.error("Error parsing chunk:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prevMessages) => [...prevMessages, { sender: "Bot", text: "Error: Unable to connect." }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chatbot-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === "User" ? "user-message" : "bot-message"}>
            <strong>{msg.sender}: </strong>{msg.text}
          </p>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading}>
          {isLoading ? "Waiting..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

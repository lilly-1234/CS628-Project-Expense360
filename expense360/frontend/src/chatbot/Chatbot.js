import React, { useState, useEffect } from "react";
import "./Chatbot.css"; 
import { CHATBOT_API } from "../api.js"; 
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // initialize chat with welcome message from the bot
  useEffect(() => {
    setMessages([{ sender: "BotCompleted", text: "Hi! How can I assist you today?" }]);
  }, [])
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "User", text: input };
    const botMessage = { sender: "Bot", text: "Thinking..." };

    // update messages state with the new message
    setMessages((prevMessages) => [...prevMessages, userMessage, botMessage]);
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
        // read next chunk from the response
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
      // update messages state with the latest bot response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.sender === "Bot" ? { ...msg, sender: "BotCompleted" } : msg
        )
      );
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
          
          <div key={index} className={msg.sender === "User" ? "user-message" : "bot-message"}>
            <strong>{msg.sender === "User" ? "User" : "Bot"}: </strong> <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
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

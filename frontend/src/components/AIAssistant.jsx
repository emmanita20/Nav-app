import React, { useState } from "react";
import { FiMessageSquare, FiSend } from "react-icons/fi";
import "../styles/AIAssistant.css";

const AIAssistant = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (e) => {
    e.preventDefault();
    const destination = query.trim();
    if (!destination) return;

    setIsLoading(true);
    try {
      setResponse({
        response: `I can help you get to ${destination}. Search for a room in your building, then start a route when it appears.`,
        from: "Current Location",
        to: destination,
      });
      setQuery("");
    } catch (err) {
      setResponse({
        response: "I could not process that request. Try a room name or department.",
        to: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-card">
      <h3 className="ai-title">
        <FiMessageSquare /> AI Assistant
      </h3>

      {response && (
        <div className="ai-response">
          <p>{response.response}</p>
          <button onClick={() => setResponse(null)} className="btn btn-small">
            Got it
          </button>
        </div>
      )}

      <form onSubmit={handleQuery} className="ai-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask for a room or department"
          className="ai-input"
        />
        <button type="submit" disabled={isLoading || !query.trim()} className="btn btn-icon">
          <FiSend />
        </button>
      </form>

      <div className="ai-tips">
        <p className="ai-tips-title">Try asking:</p>
        <p>- Where is the ICU?</p>
        <p>- Nearest restroom</p>
        <p>- How do I get to emergency?</p>
      </div>
    </div>
  );
};

export default AIAssistant;

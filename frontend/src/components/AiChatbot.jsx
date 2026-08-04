import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { aiApi } from '../api/axiosConfig';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './AiChatbot.css';

export default function AiChatbot() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hi! I'm your Travixa AI Travel Assistant.\n\nAsk me anything about our tour packages, destinations, pricing, booking process or travel suggestions."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  // Hide chatbot on Admin pages or if logged in as Admin
  if (location.pathname.startsWith('/admin') || isAdmin()) {
    return null;
  }

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    // Append user message
    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.post('/ai/chat', { message: text });
      const reply = res.data?.reply || "I'm sorry, I couldn't process your request right now. Please try again.";
      setMessages([...newMessages, { sender: 'ai', text: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: "I'm currently having trouble connecting to the AI service. Please make sure the AI Service is running or try again shortly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-trigger"
        aria-label="Open AI Assistant"
        title="Travixa AI Assistant"
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <FaRobot style={{ fontSize: '20px' }} />
              <span>Travixa AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="chatbot-close-btn" aria-label="Close Chat">
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chatbot-input-container">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask a question about tours, pricing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!input.trim() || loading}
              aria-label="Send Message"
            >
              <FaPaperPlane style={{ fontSize: '14px', marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageSquareText } from 'lucide-react';
function Chatbot() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dots, setDots] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog, isLoading]); // Scroll on new messages or loading state change

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isOpen && chatLog.length === 0) {
      setChatLog([{ user: 'bot', message: 'Welcome, How May I Assist You!' }]);
    }
  }, [isOpen, chatLog.length]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newChatLog = [...chatLog, { user: 'me', message }];
    setChatLog(newChatLog);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      setChatLog([...newChatLog, { user: 'bot', message: data.response }]);
    } catch (error) {
      console.error(error);
      setChatLog([...newChatLog, { user: 'bot', message: 'Sorry, something went wrong!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      {isOpen ? (
        <div 
          style={{
            width: '320px',
            height: '400px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(139, 69, 19, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            animation: 'slideUp 0.3s ease-out',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(139, 69, 19, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#d7bb91',
              }} />
              <strong style={{ 
                fontSize: '16px', 
                letterSpacing: '0.5px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: '2000'
              }}>Bodaskar Bot</strong>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
                transform: 'scale(1)',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ×
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              backgroundColor: '#FDF5E6',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              scrollBehavior: 'smooth',
            }}
          >
            {chatLog.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.user === 'me' ? 'flex-end' : 'flex-start',
                  animation: `${msg.user === 'me' ? 'slideLeft' : 'slideRight'} 0.3s ease-out`,
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    backgroundColor: msg.user === 'me' ? '#8B4513' : '#fff',
                    color: msg.user === 'me' ? '#fff' : '#000',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderBottomRightRadius: msg.user === 'me' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.user === 'me' ? '16px' : '4px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    letterSpacing: '0.2px',
                    fontWeight: '400',
                  }}
                >
                  {msg.user === 'bot' ? (
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                  ) : (
                    msg.message
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '4px', padding: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#8B4513',
                  animation: 'bounce 0.6s infinite',
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#8B4513',
                  animation: 'bounce 0.6s infinite 0.2s',
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#8B4513',
                  animation: 'bounce 0.6s infinite 0.4s',
                }} />
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Scroll anchor */}
          </div>

          <div
            style={{
              padding: '12px',
              borderTop: '1px solid rgba(139, 69, 19, 0.1)',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #d7bb91',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: '14px',
                }}
                onFocus={(e) => e.target.style.borderColor = '#8B4513'}
                onBlur={(e) => e.target.style.borderColor = '#d7bb91'}
                placeholder="Type a message..."
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#8B4513',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: 'scale(1)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquareText/>
        </button>
      )}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes slideLeft {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          @keyframes slideRight {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}
      </style>
    </div>
  );
}

export default Chatbot;
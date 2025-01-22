import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function Chatbot() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State to toggle chat window

  // Add a default welcome message when the chatbot is opened for the first time
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
      const response = await axios.post('http://localhost:5000/api/chat', { message });
      setChatLog([...newChatLog, { user: 'bot', message: response.data.response }]);
    } catch (error) {
      console.error(error);
      setChatLog([...newChatLog, { user: 'bot', message: 'Sorry, something went wrong!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: 'fixed', // Fixed position to stay in the corner
        bottom: '20px', // Position from the bottom
        right: '20px', // Position from the right
        zIndex: 1000, // Ensure it stays on top of other elements
      }}
    >
      {isOpen ? (
        <div
          style={{
            width: '300px', // Fixed width for the chat window
            height: '400px', // Fixed height for the chat window
            backgroundColor: '#fff', // White background
            border: '1px solid #d7bb91', // Light beige border
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '10px',
              backgroundColor: '#8B4513', // Rich brown header
              color: '#fff', // White text
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>AI Chatbot</strong>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff', // White close button
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
              backgroundColor: '#f9f9f9', // Light gray background for chat log
            }}
          >
            {chatLog.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '10px',
                  textAlign: msg.user === 'me' ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    marginTop: '5px',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: msg.user === 'me' ? '#d7bb91' : '#fff', // Light beige for user messages, white for bot messages
                    display: 'inline-block',
                    maxWidth: '80%',
                    textAlign: 'left',
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
            {isLoading && <div>Stylist is typing...</div>} {/* Updated loading message */}
          </div>
          <div
            style={{
              padding: '10px',
              borderTop: '1px solid #d7bb91', // Light beige border
              backgroundColor: '#fff', // White background
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: 'calc(100% - 70px)',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #d7bb91', // Light beige border
                marginRight: '10px',
                backgroundColor: '#fff', // White background
                color: '#8B4513', // Rich brown text
              }}
              disabled={isLoading}
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#8B4513', // Rich brown button
                color: '#fff', // White text
                cursor: 'pointer',
              }}
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#8B4513', // Rich brown button
            color: '#fff', // White text
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            fontSize: '24px',
          }}
        >
          💬
        </button>
      )}
    </div>
  );
}

export default Chatbot;
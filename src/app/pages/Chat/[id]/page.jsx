'use client';
import { useParams } from 'next/navigation';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const ChatInterface = () => {
  const [user, setUser] = useState(null); // State to store user data
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]); // Make sure this is initialized as an empty array
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const params = useParams();
  const receiver_id = parseInt(params?.id);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return; // Wait until user is loaded

    // Initialize socket connection
    const newSocket = io('http://127.0.0.1:5000');
    setSocket(newSocket);

    // Join the chat room
    const room = `chat_${Math.min(user.user_id, receiver_id)}_${Math.max(user.user_id, receiver_id)}`;
    newSocket.emit('join', { room });

    // Load chat history
    fetchChatHistory();

    // Listen for new messages
    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => newSocket.close();
  }, [user, receiver_id]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/chat-history/${receiver_id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}` // Use the token from localStorage
        }
      });
      const data = await response.json();
      setMessages(data.messages); // Make sure to access 'messages' property if it's inside an object
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setLoading(false);
    }
  };
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit('private_message', {
      sender_id: user.user_id, // Use the user_id from localStorage
      receiver_id: receiver_id,
      message: newMessage.trim()
    });

    setNewMessage('');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
  <div className="chat-container">
    <Header />
    <div className="chat-main">
      <div className="chat-box">
        {/* Messages Container */}
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender_id === user.user_id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{message.message}</p>
                <p className="message-time">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="input-form">
          <div className="input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="message-input"
              placeholder="Type your message..."
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
    <style jsx>{`
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f4f7fc;
    font-family: 'Roboto', sans-serif;
  }

  .chat-main {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
  }

  .chat-box {
    width: 100%;
    max-width: 900px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e4e8f1;
  }

  .messages-container {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    margin-bottom: 1rem;
    transition: transform 0.3s ease-in-out;
  }

  .message.sent {
    justify-content: flex-end;
  }

  .message-content {
    max-width: 70%;
    padding: 1rem;
    border-radius: 16px;
    position: relative;
    transition: all 0.3s ease;
  }

  .sent .message-content {
    background-color: #0084ff;
    color: white;
    border-radius: 16px 16px 0 16px;
    box-shadow: 0 4px 8px rgba(0, 132, 255, 0.2);
  }

  .received .message-content {
    background-color: #f1f3f8;
    color: #333;
    border-radius: 16px 16px 16px 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }

  .message-time {
    font-size: 0.75rem;
    color: #9fa2b4;
    opacity: 0.8;
    margin-top: 0.5rem;
    text-align: right;
  }

  .sent .message-time {
    text-align: right;
  }

  .input-form {
    padding: 1rem;
    background-color: #ffffff;
    border-top: 1px solid #e4e8f1;
  }

  .input-container {
    display: flex;
    gap: 1rem;
  }

  .message-input {
    flex: 1;
    padding: 1rem;
    border: 1px solid #e4e8f1;
    border-radius: 50px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .message-input:focus {
    border-color: #0084ff;
    box-shadow: 0 0 8px rgba(0, 132, 255, 0.2);
  }

  .send-button {
    padding: 0.75rem 1.25rem;
    background-color: #0084ff;
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .send-button:hover {
    background-color: #0073e6;
    transform: scale(1.05);
  }

  .send-button:active {
    background-color: #0066cc;
    transform: scale(1);
  }

  .send-button:disabled {
    background-color: #b0c4de;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .chat-main {
      padding: 1rem;
    }

    .chat-box {
      border-radius: 0;
    }

    .message-content {
      max-width: 80%;
    }

    .input-container {
      flex-direction: column;
    }

    .message-input {
      width: 100%;
    }

    .send-button {
      width: 100%;
      padding: 0.75rem 1rem;
    }
  }

  @media (max-width: 480px) {
    .message-time {
      font-size: 0.65rem;
    }

    .message-content {
      padding: 0.8rem 1rem;
      font-size: 0.9rem;
    }

    .send-button {
      padding: 0.75rem;
    }
  }
`}</style>

  </div>
);
};

export default ChatInterface;

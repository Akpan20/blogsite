import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
}

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  read_at: string | null;
  created_at: string;
  sender: User;
  recipient: User;
}

interface Conversation {
  user: User;
  last_message: Message;
  unread_count: number;
}

export default function MessagingInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
    
    // Listen for new messages via WebSocket
    const channel = window.Echo?.private(`App.Models.User.${currentUser?.id}`);
    channel?.listen('.message.sent', (e: any) => {
      handleNewMessage(e.message);
    });

    return () => {
      channel?.stopListening('.message.sent');
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await axios.get('/api/user');
      setCurrentUser(data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('/api/messages/conversations');
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/messages/${userId}`);
      setMessages(data);
      
      // Mark messages as read
      await axios.post(`/api/messages/${userId}/read`);
      
      // Update conversation unread count
      setConversations(prev =>
        prev.map(conv =>
          conv.user.id === userId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const { data } = await axios.post(`/api/messages/${activeConversation}`, {
        content: newMessage.trim()
      });
      
      setMessages(prev => [...prev, data]);
      setNewMessage('');
      
      // Update conversation list
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    // Add to messages if viewing that conversation
    if (activeConversation === message.sender_id) {
      setMessages(prev => [...prev, message]);
      // Mark as read immediately
      axios.post(`/api/messages/${message.sender_id}/read`);
    }
    
    // Update conversations list
    fetchConversations();
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm('Delete this message?')) return;

    try {
      await axios.delete(`/api/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const activeUser = conversations.find(c => c.user.id === activeConversation)?.user;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start chatting with someone!</p>
            </div>
          ) : (
            conversations.map(({ user, last_message, unread_count }) => (
              <div
                key={user.id}
                onClick={() => setActiveConversation(user.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  activeConversation === user.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(last_message.created_at)}
                      </span>
                    </div>
                    
                    <p className={`text-sm truncate ${
                      unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}>
                      {last_message.sender_id === currentUser?.id ? 'You: ' : ''}
                      {last_message.content}
                    </p>
                    
                    {unread_count > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        {unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation && activeUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <img
                src={activeUser.avatar_url || `https://ui-avatars.com/api/?name=${activeUser.name}`}
                alt={activeUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{activeUser.name}</h3>
                <p className="text-sm text-gray-500">@{activeUser.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Send a message to start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === currentUser?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : ''}`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="wrap-break-words">{message.content}</p>
                        </div>
                        
                        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{formatTime(message.created_at)}</span>
                          {isOwnMessage && message.read_at && (
                            <span className="text-blue-600">✓✓</span>
                          )}
                          {isOwnMessage && (
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
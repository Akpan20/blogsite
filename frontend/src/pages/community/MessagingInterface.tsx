import React, { useState, useEffect, useRef, useMemo, inputRef, searchRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { initEcho } from '@/lib/echo-config';
import {
  Send, MoreVertical, MessageSquare,
  Edit, X, Search, Check, CheckCheck, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface ChatUser {
  id: string | number;
  username: string;
  name: string;
  avatar?: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface Message {
  id: string | number;
  sender_id: string | number;
  receiver_id?: string | number;
  content: string;
  read_at: string | null;
  created_at: string;
  is_read?: boolean;
}

interface Conversation {
  user: ChatUser;
  last_message: {
    content: string;
    sender_id: string | number;
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
}

// ─── Helper Components (Avatar, Item, Bubble, etc.) ──────────────────────────
function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getAvatarSrc(user: ChatUser) {
  return user.avatar_url || user.avatar || null;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = 'md', showOnline = false }: { 
  user: ChatUser; 
  size?: 'sm' | 'md' | 'lg'; 
  showOnline?: boolean 
}) {
  const dims: Record<string, string> = { 
    sm: 'h-9 w-9 text-xs', 
    md: 'h-11 w-11 text-sm', 
    lg: 'h-14 w-14 text-base' 
  };
  const src = getAvatarSrc(user);
  
  return (
    <div className="relative shrink-0">
      {src ? (
        <img 
          src={src} 
          className={`${dims[size]} rounded-full object-cover ring-2 ring-white`} 
          alt={user.name} 
        />
      ) : (
        <div className={`${dims[size]} rounded-full bg-linear-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold ring-2 ring-white`}>
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      {showOnline && user.is_online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
      )}
    </div>
  );
}

// ─── ConversationItem ─────────────────────────────────────────────────────────

function ConversationItem({
  conv, active, currentUserId, onClick,
}: {
  conv: Conversation & { isTemp?: boolean };
  active: boolean;
  currentUserId: string | number | null;
  onClick: () => void;
}) {
  const { user, last_message, unread_count } = conv;
  const isOwn = last_message?.sender_id === currentUserId;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex gap-3 items-center transition-all duration-150 border-b border-slate-100/60 hover:bg-slate-50 focus:outline-none ${
        active ? 'bg-slate-50 shadow-[inset_3px_0_0_0_#0f172a]' : ''
      }`}
    >
      <Avatar user={user} showOnline />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-1">
          <span className={`text-sm truncate ${unread_count > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
            {user.name}
          </span>
          {last_message && (
            <span className="text-[10px] text-slate-400 shrink-0">
              {formatTime(last_message.created_at)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center gap-1 mt-0.5">
          <p className={`text-xs truncate ${unread_count > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
            {(conv as any).isTemp
              ? <span className="italic text-blue-500">New conversation</span>
              : last_message
                ? <>{isOwn && <span className="mr-1">{last_message.is_read ? <CheckCheck size={11} className="inline text-blue-500" /> : <Check size={11} className="inline" />}</span>}{last_message.content}</>
                : <span className="italic">No messages yet</span>
            }
          </p>
          {unread_count > 0 && (
            <span className="shrink-0 bg-slate-900 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
              {unread_count > 9 ? '9+' : unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[70%] px-4 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? 'bg-slate-900 text-white rounded-2xl rounded-br-sm'
            : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-100 shadow-sm'
        }`}
      >
        {message.content}
        <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOwn ? 'text-slate-400 justify-end' : 'text-slate-400'}`}>
          {formatTime(message.created_at)}
          {isOwn && (
            message.read_at
              ? <CheckCheck size={11} className="text-blue-400" />
              : <Check size={11} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DateDivider ──────────────────────────────────────────────────────────────

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─── UserSearchResult ────────────────────────────────────────────────────────

function UserSearchResult({ user, onClick }: { user: ChatUser; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left focus:outline-none border-b border-slate-100 last:border-0"
    >
      <Avatar user={user} size="sm" showOnline />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
        <p className="text-xs text-slate-400">@{user.username}</p>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessagingInterface() {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | number | null>(null);
  const [tempChatUser, setTempChatUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [isMobileShowingChat, setIsMobileShowingChat] = useState(false);

  // Search/Compose State
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for logic stabilization
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | number | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ref with state so the Echo listener always knows the current open chat
  useEffect(() => {
    activeIdRef.current = activeConversationId;
    if (activeConversationId) fetchMessages(activeConversationId);
  }, [activeConversationId]);

  // ── 1. Initial Load (Fixed 401 Race Condition) ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Force Axios to use the current token before any calls
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        setIsLoadingConversations(true);
        const [userRes, convRes] = await Promise.all([
          axios.get('/api/user'),
          axios.get('/api/messages/conversations')
        ]);
        setCurrentUser(userRes.data);
        setConversations(convRes.data);
      } catch (err: any) {
        console.error('Init failed:', err);
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setIsLoadingConversations(false);
      }
    };
    init();
  }, [navigate]);

  // ── 2. Real-time Messaging (Stable Listener) ────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return;

    const token = localStorage.getItem('auth_token');
    const echo = initEcho(token || undefined);
    const channel = echo.private(`App.Models.User.${currentUser.id}`);

    channel.listen('.MessageSent', (event: { message: Message }) => {
      const incoming = event.message;
      const currentActiveId = activeIdRef.current;

      // Update Messages if chat is open
      if (incoming.sender_id === currentActiveId || incoming.receiver_id === currentActiveId) {
        setMessages(prev => [...prev, incoming]);
      }

      // Update Sidebar
      setConversations(prev => {
        const otherUserId = incoming.sender_id === currentUser.id ? incoming.receiver_id : incoming.sender_id;
        const existingIndex = prev.findIndex(c => c.user.id === otherUserId);
        
        const updatedLastMessage = {
          content: incoming.content,
          sender_id: incoming.sender_id,
          created_at: incoming.created_at,
          is_read: incoming.is_read ?? false,
        };

        if (existingIndex !== -1) {
          const updated = {
            ...prev[existingIndex],
            last_message: updatedLastMessage,
            unread_count: (incoming.receiver_id === currentUser.id && otherUserId !== currentActiveId)
              ? prev[existingIndex].unread_count + 1
              : prev[existingIndex].unread_count,
          };
          return [updated, ...prev.filter((_, i) => i !== existingIndex)];
        }
        return prev; // For brand new convos, you might trigger a re-fetch or manual insert
      });
    });

    return () => { channel.stopListening('.MessageSent'); };
  }, [currentUser?.id]);

  // ── 3. Actions ──────────────────────────────────────────────────────────────

  const fetchMessages = async (userId: string | number) => {
    setIsLoadingMessages(true);
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      setMessages(Array.isArray(data) ? data : data.messages ?? []);
      axios.post(`/api/messages/${userId}/mark-all-read`).catch(() => {});
      setConversations(prev => prev.map(c => c.user.id === userId ? { ...c, unread_count: 0 } : c));
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !activeConversationId) return;

    setNewMessage('');
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUser?.id ?? '',
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimistic]);

    try {
      const { data } = await axios.post(`/api/messages/${activeConversationId}`, { content });
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m));
      
      if (tempChatUser) {
        setTempChatUser(null);
        const res = await axios.get('/api/messages/conversations');
        setConversations(res.data);
      }
    } catch {
      toast.error('Failed to send');
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }
  };

  // ─── Derived State ──────────────────────────────────────────────────────────

  const activeChatPartner = useMemo(() => {
    if (tempChatUser?.id === activeConversationId) return tempChatUser;
    return conversations.find(c => c.user.id === activeConversationId)?.user ?? null;
  }, [activeConversationId, conversations, tempChatUser]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { label: string; messages: Message[] }[] = [];
    let lastLabel = '';
    messages.forEach(msg => {
      const d = new Date(msg.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      const label = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      if (label !== lastLabel) { groups.push({ label, messages: [] }); lastLabel = label; }
      groups[groups.length - 1].messages.push(msg);
    });
    return groups;
  }, [messages]);

  const allConversations = useMemo(() => {
    const list: (Conversation & { isTemp?: boolean })[] = tempChatUser
      ? [{ user: tempChatUser, last_message: null, unread_count: 0, isTemp: true }, ...conversations]
      : conversations;
    return list;
  }, [conversations, tempChatUser]);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden max-w-6xl mx-auto mt-4 rounded-xl border border-slate-200 shadow-sm">
      {/* ── Sidebar ── */}
      <aside className={`${isMobileShowingChat ? 'hidden' : 'flex'} md:flex w-full md:w-80 flex-col bg-white border-r border-slate-100`}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Messages</h1>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            onClick={() => setShowCompose(v => !v)}
            title="New message"
          >
            {showCompose ? <X size={16} /> : <Edit size={16} />}
          </Button>
        </div>

        {/* Compose / Search Panel */}
        {showCompose && (
          <div className="border-b border-slate-100 bg-slate-50/80">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => handleComposeSearch(e.target.value)}
                  placeholder="Search people..."
                  className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {searchQuery.length >= 2 && (
              <div className="max-h-56 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-3 items-center px-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-2.5 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(u => (
                    <UserSearchResult key={u.id} user={u} onClick={() => startConversationWith(u)} />
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">No users found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="px-4 py-3 flex gap-3 items-center border-b border-slate-100">
                <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
            ))
          ) : allConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 p-8">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <MessageSquare size={28} className="opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">No conversations yet</p>
                <p className="text-xs mt-1">Click the pencil icon to start one</p>
              </div>
            </div>
          ) : (
            allConversations.map(conv => (
              <ConversationItem
                key={conv.user.id}
                conv={conv}
                active={activeConversationId === conv.user.id}
                currentUserId={currentUser?.id ?? null}
                onClick={() => {
                  setActiveConversationId(conv.user.id);
                  setIsMobileShowingChat(true);
                  setShowCompose(false);
                }}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Chat Area ── */}
      <main className={`${!isMobileShowingChat ? 'hidden' : 'flex'} md:flex flex-1 flex-col bg-[#f8fafc] min-w-0`}>
        {activeChatPartner ? (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 mr-1 text-slate-500"
                onClick={() => setIsMobileShowingChat(false)}
              >
                <ArrowLeft size={18} />
              </Button>
              <Avatar user={activeChatPartner} showOnline />
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm text-slate-900 truncate">{activeChatPartner.name}</h2>
                <p className="text-[11px] text-slate-400">
                  {activeChatPartner.is_online
                    ? <span className="text-emerald-500 font-medium">● Online</span>
                    : `@${activeChatPartner.username}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg">
                <MoreVertical size={16} />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
              {isLoadingMessages ? (
                <div className="flex flex-col gap-4 pt-4">
                  {[70, 50, 80, 60].map((w, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <Skeleton className={`h-10 rounded-2xl`} style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <MessageSquare size={22} className="opacity-30" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No messages yet</p>
                  <p className="text-xs">Say hello to {activeChatPartner.name}!</p>
                </div>
              ) : (
                groupedMessages.map(group => (
                  <div key={group.label}>
                    <DateDivider label={group.label} />
                    <div className="space-y-1.5">
                      {group.messages.map(msg => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwn={String(msg.sender_id) === String(currentUser?.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="px-4 py-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-2">
                <input
                  ref={inputRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e as any); } }}
                  placeholder={`Message ${activeChatPartner.name}…`}
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 active:scale-95"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="h-20 w-20 rounded-3xl bg-white border border-slate-100 shadow-md flex items-center justify-center">
              <MessageSquare size={36} className="opacity-20" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-700 text-lg">Your Messages</p>
              <p className="text-sm mt-1">Select a conversation or start a new one</p>
            </div>
            <Button
              variant="outline"
              className="mt-2 gap-2 text-sm rounded-xl"
              onClick={() => setShowCompose(true)}
            >
              <Edit size={14} /> New Message
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
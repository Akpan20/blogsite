import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationActor {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
}

interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    follower?: NotificationActor;
    sender?: NotificationActor;
    url?: string;
  };
  read_at: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: string): string {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const mins  = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days  = Math.floor(diffMs / 86_400_000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return d.toLocaleDateString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotificationIcon({ type }: { type: string }) {
  const base = 'w-9 h-9 rounded-full flex items-center justify-center shrink-0';

  if (type.includes('UserFollowed')) {
    return (
      <div className={`${base} bg-violet-100`}>
        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }

  if (type.includes('MessageReceived')) {
    return (
      <div className={`${base} bg-blue-100`}>
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${base} bg-slate-100`}>
      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-3 p-4 border-b border-slate-100 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="h-3 bg-slate-200 rounded w-4/5" />
        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationDropdown() {
  const { user, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isOpen, setIsOpen]               = useState(false);
  const [loading, setLoading]             = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      const list: Notification[] = data.data ?? data;
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read_at).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auth-gated effects ──────────────────────────────────────────────────────

  useEffect(() => {
    // Wait for auth to finish loading AND confirm the user is logged in
    if (authLoading || !user) return;

    fetchNotifications();

    // Real-time via Echo
    const channel = window.Echo?.private(`App.Models.User.${user.id}`);
    channel?.notification((notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New notification', {
          body: notification.data.message,
          icon: '/logo.png',
        });
      }
    });

    return () => {
      channel?.stopListening('.notification');
    };
  }, [user?.id, authLoading]); // key on user.id — re-runs after login

  // ── Close on outside click ──────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    const target = notifications.find(n => n.id === id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (target && !target.read_at) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.read_at) markAsRead(n.id);
    setIsOpen(false);
  };

  // ── Guard — don't render for unauthenticated users ──────────────────────────

  if (authLoading || !user) return null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-95 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold bg-slate-900 text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-105 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
            ) : notifications.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                <p className="text-xs mt-1">We'll let you know when something happens</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`group flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                    !notification.read_at ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <NotificationIcon type={notification.type} />

                  <div className="flex-1 min-w-0">
                    {notification.data.url ? (
                      <Link
                        to={notification.data.url}
                        onClick={() => handleNotificationClick(notification)}
                        className="block"
                      >
                        <p className="text-sm text-slate-800 leading-snug">
                          {notification.data.message}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </Link>
                    ) : (
                      <div
                        onClick={() => handleNotificationClick(notification)}
                        className="cursor-pointer"
                      >
                        <p className="text-sm text-slate-800 leading-snug">
                          {notification.data.message}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read_at && (
                      <button
                        onClick={e => { e.stopPropagation(); markAsRead(notification.id); }}
                        className="p-1 rounded text-blue-500 hover:bg-blue-100 transition-colors"
                        title="Mark as read"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }}
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Unread dot */}
                  {!notification.read_at && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
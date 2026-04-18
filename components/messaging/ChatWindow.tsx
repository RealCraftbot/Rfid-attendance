'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowRight, RefreshCw, User, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  userId: string;
  lastMessage: Message;
  unread: number;
}

interface ChatWindowProps {
  conversationWith?: string;
  userName?: string;
  userRole?: string;
}

export default function ChatWindow({ conversationWith, userName = 'User', userRole }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConversations, setShowConversations] = useState(!conversationWith);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationWith) {
      fetchMessages();
    } else {
      fetchConversations();
    }
  }, [conversationWith]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversationWith) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?userId=${conversationWith}`);
      const data = await res.json();
      if (data.data) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.data) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationWith) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: conversationWith, content: newMessage.trim() }),
      });
      const data = await res.json();
      if (data.data) {
        setMessages((prev) => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const forwardMessage = async (messageId: string, recipientId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (data.data) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to forward message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (conversationWith) {
    return (
      <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">
        <ChatHeader userName={userName} onBack={() => setShowConversations(true)} />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ChatBubble
                  message={msg}
                  isOwn={msg.senderId !== conversationWith}
                  onForward={(id) => forwardMessage(id, conversationWith)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-center py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-blue" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={sendMessage}
          onKeyPress={handleKeyPress}
          disabled={sending}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">
      <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-brand-navy to-brand-blue">
        <h2 className="text-lg font-bold text-white">Messages</h2>
      </div>
      
      <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-blue" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <User className="w-12 h-12 mb-3" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {conversations.map((conv, index) => (
              <motion.button
                key={conv.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => window.location.assign(`/messages?userId=${conv.userId}`)}
                className="w-full flex items-center gap-3 p-4 hover:bg-zinc-50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-brand-purple flex items-center justify-center">
                  <User className="w-6 h-6 text-brand-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-brand-navy truncate">{conv.lastMessage?.senderId === conv.userId ? 'them' : 'You'}</p>
                    <span className="text-xs text-zinc-400">
                      {conv.lastMessage?.createdAt && format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 truncate">{conv.lastMessage?.content}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function ChatHeader({ userName, onBack }: { userName: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-zinc-100 bg-white">
      {onBack && (
        <button onClick={onBack} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
          <ArrowRight className="w-5 h-5 rotate-180 text-zinc-600" />
        </button>
      )}
      <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center">
        <User className="w-5 h-5 text-brand-navy" />
      </div>
      <div>
        <p className="font-semibold text-brand-navy">{userName}</p>
        <p className="text-xs text-zinc-400">Active now</p>
      </div>
    </div>
  );
}

function ChatBubble({ message, isOwn, onForward }: { message: Message; isOwn: boolean; onForward?: (id: string) => void }) {
  const [showForward, setShowForward] = useState(false);

  return (
    <motion.div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowForward(true)}
      onMouseLeave={() => setShowForward(false)}
    >
      <div className="relative group">
        <div
          className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-brand-blue text-white rounded-br-md'
              : 'bg-white text-brand-navy rounded-bl-md shadow-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-zinc-400'}`}>
            <span className="text-xs">{format(new Date(message.createdAt), 'HH:mm')}</span>
            {isOwn && (
              message.isRead ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
        <AnimatePresence>
          {showForward && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onForward?.(message.id)}
              className={`absolute top-1/2 -translate-y-1/2 ${
                isOwn ? '-left-10' : '-right-10'
              } p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors`}
            >
              <ArrowRight className="w-4 h-4 text-zinc-600" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MessageInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}) {
  return (
    <div className="p-4 border-t border-zinc-100 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-4 py-2.5 bg-zinc-50 border-0 rounded-2xl resize-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
          disabled={disabled}
        />
        <motion.button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-brand-blue text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/20"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
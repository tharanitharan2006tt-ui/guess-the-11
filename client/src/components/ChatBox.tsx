import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, SOCKET_EVENTS } from '@guess-the-11/shared';
import { socketService } from '../services/socket';
import { Send, Sparkles, MessageSquare } from 'lucide-react';
import { sounds } from '../utils/sound';

interface ChatBoxProps {
  roomCode: string;
  playerId: string;
  isDrawer: boolean;
  hasGuessedThisRound: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  roomCode,
  playerId,
  isDrawer,
  hasGuessedThisRound
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [statusText, setStatusText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = socketService.getSocket();

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.type === 'correct') {
        sounds.playCorrect();
      }
    };

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');

    if (isDrawer) {
      socketService.sendChat(roomCode, playerId, text);
      return;
    }

    if (hasGuessedThisRound) {
      socketService.sendChat(roomCode, playerId, text);
      return;
    }

    const res = await socketService.submitGuess(roomCode, playerId, text);
    if (!res.success && res.error) {
      setStatusText(res.error);
      setTimeout(() => setStatusText(null), 2500);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-900/90 overflow-hidden border-2 border-slate-800 shadow-xl">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span className="font-game font-bold text-xs tracking-wide text-slate-100">
            Live Chat & Guesses
          </span>
        </div>
        {hasGuessedThisRound && (
          <span className="px-2.5 py-0.5 text-[10px] font-game font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Guessed!
          </span>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[180px] max-h-[300px] md:max-h-[360px]">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-sans italic">
            No messages yet. Type your guess below!
          </div>
        )}

        {messages.map((msg) => {
          if (msg.type === 'correct') {
            return (
              <div
                key={msg.id}
                className="p-2 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-300 text-xs font-game font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>🎉 {msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'join' || msg.type === 'leave' || msg.type === 'system') {
            return (
              <div
                key={msg.id}
                className="text-center py-1 text-[11px] font-sans font-medium text-slate-400 italic"
              >
                {msg.text}
              </div>
            );
          }

          const isSelf = msg.senderId === playerId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-slate-400 font-sans font-medium mb-0.5">
                {msg.senderName}
              </span>
              <div
                className={`px-3 py-1.5 rounded-2xl text-xs max-w-[85%] break-words font-sans font-medium ${
                  isSelf
                    ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none shadow-sm'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Status Alert if error */}
      {statusText && (
        <div className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-sans font-medium text-center border-t border-amber-500/30">
          {statusText}
        </div>
      )}

      {/* Input Field */}
      <form
        onSubmit={handleSend}
        className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isDrawer
              ? 'You are drawing! Chat with players...'
              : hasGuessedThisRound
              ? 'You guessed! Chat with other players...'
              : 'Type your guess here...'
          }
          maxLength={60}
          className="flex-1 bg-slate-950 text-white text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-amber-400 font-sans transition-colors placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-3d-amber px-3.5 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4 text-slate-950" />
        </button>
      </form>
    </div>
  );
};

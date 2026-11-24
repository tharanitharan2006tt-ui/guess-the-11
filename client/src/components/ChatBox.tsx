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
    <div className="flex flex-col h-full rounded-2xl glass-card overflow-hidden border border-white/10 shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-[#181E32] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#28C7E8]" />
          <span className="font-bold text-xs tracking-wide text-[#F4F5FF]">
            Live Chat & Guesses
          </span>
        </div>
        {hasGuessedThisRound && (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#28DFA5]/20 text-[#28DFA5] border border-[#28DFA5]/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#28DFA5]" /> Guessed!
          </span>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[180px] max-h-[300px] md:max-h-[360px]">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-[#929BB3] italic">
            No messages yet. Type your guess below!
          </div>
        )}

        {messages.map((msg) => {
          if (msg.type === 'correct') {
            return (
              <div
                key={msg.id}
                className="p-2.5 rounded-xl bg-[#28DFA5]/15 border border-[#28DFA5]/30 text-[#28DFA5] text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <span>🎉 {msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'join' || msg.type === 'leave' || msg.type === 'system') {
            return (
              <div
                key={msg.id}
                className="text-center py-1 text-[11px] font-medium text-[#929BB3] italic"
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
              <span className="text-[10px] text-[#929BB3] font-medium mb-0.5">
                {msg.senderName}
              </span>
              <div
                className={`px-3 py-1.5 rounded-2xl text-xs max-w-[85%] break-words font-medium ${
                  isSelf
                    ? 'bg-[#7655F7] text-[#F4F5FF] rounded-tr-none shadow-md shadow-[#7655F7]/20'
                    : 'bg-[#181E32] text-[#F4F5FF] border border-white/[0.08] rounded-tl-none'
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
        <div className="px-3 py-1 bg-[#FFC857]/20 text-[#FFC857] text-[11px] font-medium text-center border-t border-[#FFC857]/30">
          {statusText}
        </div>
      )}

      {/* Input Field */}
      <form
        onSubmit={handleSend}
        className="p-2.5 bg-[#0D1221] border-t border-white/[0.08] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isDrawer
              ? '🎨 You are drawing! Chat with players...'
              : hasGuessedThisRound
              ? '🎉 You guessed correctly! Chat with squad...'
              : '💡 Type your guess here (e.g. apple)...'
          }
          maxLength={60}
          className="flex-1 glass-input text-xs md:text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#7655F7] transition-colors placeholder:text-[#929BB3] text-[#F4F5FF]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-glass-primary px-4 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-[#F4F5FF] active:scale-95"
          title="Send guess or message"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
};

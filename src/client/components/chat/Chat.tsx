import { useState, useEffect, useRef } from 'react';
import './Chat.css';
import {useMatchDetails} from "../../context/MatchDetailsContext.tsx";
import {useGame} from "../../context/GameContext.tsx";

export const Chat = () => {
  const game = useGame();

  const chatMessages = game.chatMessages;
  const playerId = game.selfPlayerId;

  const { matchDetails } = useMatchDetails();

  const playerNames = matchDetails?.players.reduce((acc, p) => {
    acc[p.id.toString()] = p.name || `Player ${p.id}`;
    return acc;
  }, {} as Record<string, string>) || {};

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCount = useRef(chatMessages.length);

  useEffect(() => {
    if (chatMessages.length > lastMessageCount.current) {
      if (!isOpen) {
        setUnreadCount(prev => prev + (chatMessages.length - lastMessageCount.current));
      }
      setTimeout(scrollToBottom, 100);
    }
    lastMessageCount.current = chatMessages.length;
  }, [chatMessages.length, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && game.sendChatMessage) {
      game.sendChatMessage(message.trim());
      setMessage('');
    }
  };

  const toggleChat = () => {
    setIsOpen(current => !current);
    if (!isOpen) setUnreadCount(0);
  };

  if (!game.sendChatMessage && chatMessages.length === 0) return null;

  return (
    <div className={`chat-container ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Match Chat</h3>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">No messages yet...</div>
            ) : (
              chatMessages.map((msg) => {
                const isSelf = msg.sender === playerId;
                const senderName = playerNames[msg.sender] || `Player ${msg.sender}`;
                return (
                  <div key={msg.id} className={`chat-message ${isSelf ? 'self' : 'other'}`}>
                    <div className="message-content">
                        {typeof msg.payload === 'object' ? JSON.stringify(msg.payload) : msg.payload}
                    </div>
                    {!isSelf && <div className="message-sender">{senderName}</div>}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={playerId ? "Type a message..." : "Spectators can't chat"}
              disabled={!playerId}
              className="chat-input"
            />
            <button type="submit" disabled={!message.trim() || !playerId} className="chat-send-btn">
              ➤
            </button>
          </form>
        </div>
      )}

      <button className="chat-toggle-btn" onClick={toggleChat} aria-label="Toggle Chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {unreadCount > 0 && <span className="chat-toggle-badge">{unreadCount}</span>}
      </button>
    </div>
  );
};

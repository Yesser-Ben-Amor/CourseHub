// SimpleChatComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SimpleChatComponent.css';

interface ChatMessage {
    id: string;
    content: string;
    sender: string;
    seminarId: string;
    timestamp: string;
    type: 'CHAT' | 'JOIN' | 'LEAVE';
}

interface SimpleChatProps {
    seminarId: string;
    username: string;
}

const SimpleChatComponent: React.FC<SimpleChatProps> = ({ seminarId, username }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    
    // Einfache Emoji-Liste
    const emojis = [
        '😊', '😂', '😍', '😭', '😎', '👍', '👎', '❤️', '🎉', '🔥',
        '😡', '😱', '🤔', '🙄', '😴', '🤗', '🤓', '😇', '🤩', '😋',
        '👋', '👏', '👀', '💪', '🙏', '🤝', '✌️', '🤞', '👌', '✅'
    ];

    // Nachrichten laden
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get<ChatMessage[]>(`/api/chat/${seminarId}`);
                setMessages(response.data);
                setLoading(false);
                setError(null);
            } catch (err) {
                console.error('Fehler beim Laden der Nachrichten:', err);
                setError('Fehler beim Laden der Nachrichten');
                setLoading(false);
            }
        };

        // Initial laden
        fetchMessages();

        // Beitrittsnachricht senden
        const sendJoinMessage = async () => {
            try {
                await axios.post(`/api/chat/${seminarId}`, {
                    content: `${username} ist dem Chat beigetreten`,
                    sender: username,
                    type: 'JOIN'
                });
            } catch (err) {
                console.error('Fehler beim Senden der Beitrittsnachricht:', err);
            }
        };

        sendJoinMessage();

        // Polling für neue Nachrichten
        const interval = setInterval(async () => {
            try {
                // Nur neue Nachrichten der letzten 10 Sekunden laden
                const response = await axios.get<ChatMessage[]>(`/api/chat/${seminarId}?after=10`);
                if (response.data.length > 0) {
                    setMessages(prevMessages => {
                        // Doppelte Nachrichten vermeiden
                        const newMessages = response.data.filter(
                            newMsg => !prevMessages.some(existingMsg => existingMsg.id === newMsg.id)
                        );
                        return [...prevMessages, ...newMessages];
                    });
                }
            } catch (err) {
                console.error('Fehler beim Polling:', err);
            }
        }, 2000); // Alle 2 Sekunden

        // Cleanup
        return () => {
            clearInterval(interval);

            // Abschiedsnachricht senden
            const sendLeaveMessage = async () => {
                try {
                    await axios.post(`/api/chat/${seminarId}`, {
                        content: `${username} hat den Chat verlassen`,
                        sender: username,
                        type: 'LEAVE'
                    });
                } catch (err) {
                    console.error('Fehler beim Senden der Abschiedsnachricht:', err);
                }
            };

            sendLeaveMessage();
        };
    }, [seminarId, username]);

    // Automatisches Scrollen zu neuen Nachrichten
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Emoji zum Text hinzufügen
    const onEmojiClick = (emoji: string) => {
        setMessageInput(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Emoji-Picker schließen, wenn außerhalb geklickt wird
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Nachricht senden
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim()) return;

        try {
            await axios.post(`/api/chat/${seminarId}`, {
                content: messageInput.trim(),
                sender: username,
                type: 'CHAT'
            });

            setMessageInput('');
        } catch (err) {
            console.error('Fehler beim Senden der Nachricht:', err);
            setError('Nachricht konnte nicht gesendet werden');

            // Fehler nach 3 Sekunden ausblenden
            setTimeout(() => setError(null), 3000);
        }
    };

    // Formatiert einen Zeitstempel
    const formatTimestamp = (timestamp: string): string => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch  {
            return '';
        }
    };

    return (
        <div className="simple-chat-container">
            {error && <div className="chat-error">{error}</div>}

            <div className="chat-messages">
                {loading ? (
                    <div className="loading-messages">Nachrichten werden geladen...</div>
                ) : messages.length === 0 ? (
                    <div className="no-messages">Noch keine Nachrichten</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message ${msg.type.toLowerCase()} ${msg.sender === username ? 'own-message' : ''}`}
                        >
                            {msg.type === 'CHAT' ? (
                                <>
                                    <div className="message-header">
                                        <span className="sender">{msg.sender}</span>
                                        <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                                    </div>
                                    <div className="message-content">{msg.content}</div>
                                </>
                            ) : (
                                <div className="system-message">{msg.content}</div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={sendMessage}>
                <div className="chat-input-container">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Nachricht eingeben..."
                        disabled={loading}
                    />
                    <button 
                        type="button" 
                        className="emoji-button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        😊
                    </button>
                    {showEmojiPicker && (
                        <div className="emoji-picker-container" ref={emojiPickerRef}>
                            <div className="emoji-grid">
                                {emojis.map((emoji, index) => (
                                    <button 
                                        key={index} 
                                        className="emoji-item" 
                                        onClick={() => onEmojiClick(emoji)}
                                        type="button"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button type="submit" disabled={loading || !messageInput.trim()}></button>
            </form>
        </div>
    );
};

export default SimpleChatComponent;
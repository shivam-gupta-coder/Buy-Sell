import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Get JWT token from localStorage
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // Add user message immediately
        const newMessage = { text: inputMessage, isBot: false, timestamp: new Date() };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/chat', 
                { message: inputMessage },
                {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                }
            );

            // Add bot response
            const botMessage = {
                text: response.data.response,
                isBot: true,
                timestamp: response.data.timestamp,
                isCached: response.headers['x-cached-response'] === 'true'
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error.response?.status === 401 
                ? "Session expired. Please log in again."
                : "Sorry, I'm having trouble connecting. Please try again.";

            setMessages(prev => [...prev, { 
                text: errorMessage, 
                isBot: true,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // const formatTime = (timestamp) => {
    //     return new Date(timestamp).toLocaleTimeString([], { 
    //         hour: '2-digit', 
    //         minute: '2-digit' 
    //     });
    // };

    return (
        <div className="chatbot-container">
            <div className="chat-header">
                <h2>IIIT Community Chat Assistant</h2>
                <p>Ask me about buying/selling items in campus!</p>
            </div>

            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div 
                        key={index}
                        className={`message ${message.isBot ? 'bot' : 'user'}`}
                    >
                        <div className="message-content">
                            {message.text}
                            <div className="message-meta">
                                {/* <span className="timestamp">
                                    {formatTime(message.timestamp)}
                                </span> */}
                                {message.isCached && (
                                    <span className="cached-indicator">(Cached)</span>
                                )}
                                {message.isError && (
                                    <span className="error-indicator">⚠️</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot">
                        <div className="message-content loading">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading}
                >
                    {isLoading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
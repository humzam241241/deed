import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import faqData from '../data/faq.json';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      content: 'Hi there! 👋 I\'m here to answer your questions about custom apparel. Pick a question below or ask your own:',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    
    // Find FAQ match or provide default response
    setTimeout(() => {
      const matchedFaq = findFaqMatch(inputValue);
      
      if (matchedFaq) {
        const botResponse = {
          type: 'bot',
          content: matchedFaq.answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        const botResponse = {
          type: 'bot',
          content: "Thanks for your message! For immediate help, try one of the common questions above, or contact us directly for a personalized answer.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const findFaqMatch = (query) => {
    if (!query) return null;
    
    query = query.toLowerCase();
    
    // Simple keyword matching
    return faqData.find(faq => {
      const question = faq.question.toLowerCase();
      const answer = faq.answer.toLowerCase();
      
      return question.includes(query) || 
             query.includes(question.substring(0, 10)) ||
             answer.includes(query);
    });
  };

  const handlePresetQuestion = (faq) => {
    // Add user message with the preset question
    const userMessage = {
      type: 'user',
      content: faq.question,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    
    // Add bot response
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        content: faq.answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors z-40"
        aria-label="Open chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
      
      {/* Chat modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col z-40 overflow-hidden" style={{ height: '32rem' }}>
          {/* Chat header */}
          <div className="bg-primary text-white p-4">
            <h3 className="font-semibold text-lg">Quick Answers</h3>
            <p className="text-sm text-white/80">Get instant answers to common questions</p>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    <div 
                      className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Preset FAQ buttons */}
              {messages.length === 1 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-gray-600 font-medium mb-3">Common Questions:</p>
                  {faqData.slice(0, 5).map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetQuestion(faq)}
                      className="w-full text-left bg-blue-50 hover:bg-blue-100 text-gray-800 p-3 rounded-lg transition-colors text-sm border border-blue-200"
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Chat input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              
              <button
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ''}
                className={`text-white rounded-full p-2 ${
                  inputValue.trim() === ''
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90'
                }`}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {messages.length > 1 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Or choose a question:</p>
                <div className="flex flex-wrap gap-2">
                  {faqData.slice(0, 3).map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetQuestion(faq)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                    >
                      {faq.question.length > 25 ? faq.question.substring(0, 25) + '...' : faq.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

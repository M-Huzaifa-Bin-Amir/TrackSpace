import React, { useState, useEffect } from 'react';

const AskAI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hello! I am the TrackSphere Assistant. Ask me anything about asset tracking or management." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔴 TODO: Paste your API Key here
  const API_KEY = "AIzaSyCmTbsgiY68xL_2wAI77AkEErvBW20skoc"; 

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Call Gemini API (Using gemini-pro which is widely supported)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // 3. Extract AI Response
      const aiText = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: " + error.message + ". (Please check your API Key in AskAI.js)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
      {/* Chat Header */}
      <div className="bg-[#340158] p-4 text-white flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <h3 className="font-bold">TrackSphere AI Assistant</h3>
      </div>

      {/* Messages Area */}
      <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-[#7e3ff2] text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none'
              }`}
            >
              {/* Basic markdown support (bolding) */}
              {msg.text.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-full text-xs animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about assets..."
          className="flex-1 p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-[#340158] hover:bg-[#4b0082] text-white px-4 py-2 rounded-lg font-bold transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AskAI;
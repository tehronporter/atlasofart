// app/chat/page.tsx - AI Chat placeholder for art history Q&A
// Phase 15: AI Chat Interface (ready for LLM integration)

'use client';

import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Atlas of Art assistant. Ask me anything about art history, artists, movements, or specific artworks in our collection!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Integrate with LLM API (OpenAI, Anthropic, etc.)
    // For now, return a placeholder response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a placeholder response. To enable AI chat, integrate with an LLM API such as:\n\n- OpenAI GPT-4\n- Anthropic Claude\n- Together AI\n- Ollama (self-hosted)\n\nThe chat interface is ready - just add your preferred LLM backend!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Art History Assistant</h1>
            <p className="text-sm text-neutral-400">Powered by AI (coming soon)</p>
          </div>
          <a href="/" className="text-sm text-amber-500 hover:text-amber-400">← Back to Map</a>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-amber-500 text-neutral-900'
                    : 'bg-neutral-900 text-neutral-100 border border-neutral-800'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-neutral-700' : 'text-neutral-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-neutral-800 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about art history, artists, movements..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isLoading || !input.trim()
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-amber-500 text-neutral-900 hover:bg-amber-400'
              }`}
            >
              Send
            </button>
          </div>
          <p className="text-xs text-neutral-600 mt-2 text-center">
            AI responses may not be accurate. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

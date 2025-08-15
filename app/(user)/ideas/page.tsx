'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Recycle, Lightbulb, Trash2, Leaf } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  title?: string;
  tips?: string[];
  icon?: string;
  timestamp: Date;
}

const RecyclingChatInterface = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageIdCounter, setMessageIdCounter] = useState(0);


  // Translated placeholders
  const placeholders = [
    t('ecoAssist.placeholders.electronics'),
    t('ecoAssist.placeholders.plasticBottles'),
    t('ecoAssist.placeholders.pizzaBoxes'),
    t('ecoAssist.placeholders.oldClothes'),
    t('ecoAssist.placeholders.batteries'),
    t('ecoAssist.placeholders.medications'),
    t('ecoAssist.placeholders.brokenGlass'),
    t('ecoAssist.placeholders.oldFurniture')
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  // Translated quick actions
  const quickActions = [
    { 
      icon: <Recycle className="w-4 h-4" />, 
      text: t('ecoAssist.quickActions.electronics.text'), 
      query: t('ecoAssist.quickActions.electronics.query')
    },
    { 
      icon: <Trash2 className="w-4 h-4" />, 
      text: t('ecoAssist.quickActions.household.text'), 
      query: t('ecoAssist.quickActions.household.query')
    },
    { 
      icon: <Leaf className="w-4 h-4" />, 
      text: t('ecoAssist.quickActions.organic.text'), 
      query: t('ecoAssist.quickActions.organic.query')
    }
  ];

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  function parseResponse(responseText: string) {
    // Clean Markdown formatting
    const cleanedText = responseText
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}/g, '')
      .replace(/`{3}/g, '')
      .replace(/`/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    // Parse sections
    const sections = cleanedText.split(/\d+\.\s+/).filter(Boolean);
    
    return sections.map(section => {
      const [titleLine, ...rest] = section.split("\n").filter(Boolean);
      const items = rest
        .filter(line => line.trim().startsWith("-") || line.trim().startsWith("•"))
        .map(line => line.replace(/^[-•]\s*/, "").trim());
        
      return {
        title: titleLine?.trim() || '',
        tips: items,
      };
    });
  }

const callApi = async (query: string) => {
  // Declare all IDs at function scope
  const userMessageId = messageIdCounter;
  const aiMessageId = messageIdCounter + 1;
  setMessageIdCounter(prev => prev + 2);

  try {
    const userMessage: Message = {
      id: userMessageId,
      type: 'user',
      content: query,
      timestamp: new Date()
    };
     
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setInputValue('');

    const response = await axios.post(
      'https://api.fireworks.ai/inference/v1/chat/completions',
      {
        model: "accounts/fireworks/models/llama4-maverick-instruct-basic",
        messages: [{ role: "user", content: query }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY_FIRE_WORKS}`
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || t('ecoAssist.errors.noAnswer');
    const cleanReply = reply.replace(/\*\*/g, '').replace(/\*/g, '');
    const sections = parseResponse(cleanReply);

    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: cleanReply,
      timestamp: new Date(),
    };

    if (sections.length && sections[0].tips.length) {
      aiMessage.title = sections[0].title;
      aiMessage.tips = sections[0].tips;
    }

    setMessages(prev => [...prev, aiMessage]);
  } catch (err) {
    console.error(err);
    setMessages(prev => [...prev, {
      id: aiMessageId, // ✅ Now accessible here
      type: 'ai',
      content: t('ecoAssist.errors.requestError'),
      timestamp: new Date()
    }]);
  } finally {
    setIsTyping(false);
  }
};

  const handleSend = () => {
    if (!inputValue.trim()) return;
    callApi(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
      <div 
  className="min-h-screen" 
  style={{ 
    background: "linear-gradient(to right, var(--section-gradient-start), var(--section-gradient-end))",
    color: "var(--foreground)" 
  }}
>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Welcome screen */}
          {messages.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {t('ecoAssist.welcome.title')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('ecoAssist.welcome.subtitle')}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(action.query);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full transition-colors duration-200"
                  >
                    {action.icon}
                    <span className="text-sm font-medium">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="max-h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'user' ? (
                  <div className="bg-green-600 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs">
                    {msg.content}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md p-4 max-w-md">
                    {/* Clean content display */}
                    <div className="text-gray-700 whitespace-pre-line">
                      {msg.content}
                    </div>

                    {/* Tips section */}
                    {msg.tips && msg.tips.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          {t('ecoAssist.quickTips')}:
                        </p>
                        <ul className="space-y-1">
                          {msg.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                              <span className="text-sm text-gray-600">
                                {tip}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={placeholders[currentPlaceholder]}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-200"
                  rows={1}
                  style={{ minHeight: '48px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">
                {t('ecoAssist.statusMessage')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclingChatInterface;
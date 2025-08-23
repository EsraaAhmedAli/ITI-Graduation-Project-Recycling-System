'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Recycle, Lightbulb, Trash2, Leaf, Plus, MessageSquare, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';
import { useUserAuth } from '@/context/AuthFormContext';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  title?: string;
  tips?: string[];
  icon?: string;
  timestamp: Date;
  tokenCount?: number;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
}

// Token limit configuration
const DAILY_TOKEN_LIMIT = 1500; // Adjust this value as needed
const TOKEN_BUFFER = 50; // Buffer to account for token estimation inaccuracy

const RecyclingChatInterface = () => {
  const { t } = useLanguage();
   const { user } = useUserAuth();
     const [previousUserId, setPreviousUserId] = useState(null);
 const currentUserId = user?._id || 'anonymous';
  const isAnonymous = currentUserId === 'anonymous';
       const getTokenKey = (userId) => `tokensUsedToday_${userId}`;
  const getDateKey = (userId) => `lastResetDate_${userId}`;
  const getChatSessionsKey = (userId) => `chatSessions_${userId}`;
  const getCurrentChatKey = (userId) => `currentChatId_${userId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tokensUsedToday, setTokensUsedToday] = useState(0);
  const [lastResetDate, setLastResetDate] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  
  // New state for chat management
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showChatList, setShowChatList] = useState(false);

  // Generate unique chat ID
  const generateChatId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };
  
    const clearAnonymousData = () => {
    console.log('🧹 Clearing anonymous user data...');
    
    const anonymousKeys = [
      'tokensUsedToday_anonymous',
      'lastResetDate_anonymous', 
      'chatSessions_anonymous',
      'currentChatId_anonymous'
    ];
    
    anonymousKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🗑️ Removing ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Anonymous data cleared');
  };
  useEffect(() => {
    console.log('🔍 Checking for user state change:', { 
      current: currentUserId, 
      previous: previousUserId 
    });
    
    // If user just logged in (went from anonymous to authenticated)
    if (previousUserId === 'anonymous' && currentUserId !== 'anonymous') {
      console.log('🔑 User logged in, clearing anonymous data');
      clearAnonymousData();
      
      // Reset state for new user
      setMessages([]);
      setChatSessions([]);
      setCurrentChatId('');
      setMessageIdCounter(0);
      setTokensUsedToday(0);
      setLastResetDate('');
    }
    
    // Update previous user ID
    setPreviousUserId(currentUserId);
  }, [currentUserId]);


  // Create new chat session
 const createNewChat = () => {
    if (!currentUserId || currentUserId === 'anonymous') return;
    
    const newChatId = generateChatId();
    const newChat = {
      id: newChatId,
      name: `Chat ${chatSessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date()
    };
  
  // Use functional update to ensure we have latest state
    setChatSessions(prev => {
      const updatedSessions = [newChat, ...prev];
      try {
        const chatSessionsKey = getChatSessionsKey(currentUserId);
        const currentChatKey = getCurrentChatKey(currentUserId);
        localStorage.setItem(chatSessionsKey, JSON.stringify(updatedSessions));
        localStorage.setItem(currentChatKey, newChatId);
      } catch (error) {
        console.error('Error saving new chat for user:', error);
      }
      return updatedSessions;
    });
  
  setCurrentChatId(newChatId);
    setMessages([]);
    setMessageIdCounter(0);
    setShowChatList(false);
  
};
  // Load chat session
  const loadChatSession = (chatId) => {
    const session = chatSessions.find(chat => chat.id === chatId);
    if (session) {
      setCurrentChatId(chatId);
      setMessages(session.messages);
      setMessageIdCounter(session.messages.length);
      setShowChatList(false);
      
      // Save current chat ID
      const currentChatKey = getCurrentChatKey(currentUserId);
      localStorage.setItem(currentChatKey, chatId);
    }
  };
  // Delete chat session
const deleteChatSession = (chatId) => {
    const updatedSessions = chatSessions.filter(chat => chat.id !== chatId);
    setChatSessions(updatedSessions);
    
    if (currentChatId === chatId) {
      if (updatedSessions.length > 0) {
        loadChatSession(updatedSessions[0].id);
      } else {
        createNewChat();
      }
    }
    
    const chatSessionsKey = getChatSessionsKey(currentUserId);
    localStorage.setItem(chatSessionsKey, JSON.stringify(updatedSessions));
  };

  const updateCurrentChatSession = (newMessages) => {
    if (!currentChatId) return;
    
    setChatSessions(prev => {
      const updated = prev.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: newMessages,
            lastActivity: new Date(),
            name: newMessages.length > 0 ? 
              (newMessages[0].content.substring(0, 30) + (newMessages[0].content.length > 30 ? '...' : '')) : 
              chat.name
          };
        }
        return chat;
      });
      
      // Save to localStorage (anonymous or authenticated)
      const chatSessionsKey = getChatSessionsKey(currentUserId);
      localStorage.setItem(chatSessionsKey, JSON.stringify(updated));
      return updated;
    });
  };
 const updateTokens = (newTokenCount) => {
    console.log(`📈 Updating tokens for ${isAnonymous ? 'anonymous' : 'authenticated'} user:`, newTokenCount);
    setTokensUsedToday(newTokenCount);
    
    const tokenKey = getTokenKey(currentUserId);
    localStorage.setItem(tokenKey, newTokenCount.toString());
    console.log('💾 Saved to localStorage:', localStorage.getItem(tokenKey));
  };
  

  useEffect(() => {
    console.log('🚀 Token useEffect running for user:', currentUserId);
    
    const today = new Date().toDateString();
    const tokenKey = getTokenKey(currentUserId);
    const dateKey = getDateKey(currentUserId);
    
    const savedTokens = localStorage.getItem(tokenKey);
    const savedDate = localStorage.getItem(dateKey);
    
    console.log('🔧 Token initialization:', { 
      userId: currentUserId,
      isAnonymous,
      tokenKey,
      today, 
      savedTokens, 
      savedDate, 
      sameDay: savedDate === today 
    });
    
    // Only reset if it's actually a different day
    if (savedDate === today && savedTokens !== null) {
      const tokenCount = parseInt(savedTokens, 10) || 0;
      console.log('✅ KEEPING tokens (same day):', tokenCount);
      setTokensUsedToday(tokenCount);
      setLastResetDate(savedDate);
    } else {
      console.log('🔄 RESETTING tokens (new day or first time)');
      setTokensUsedToday(0);
      setLastResetDate(today);
      localStorage.setItem(tokenKey, '0');
      localStorage.setItem(dateKey, today);
    }
  }, [currentUserId]);
useEffect(() => {
    console.log('🗨️ Chat session useEffect running for user:', currentUserId);
    
    const chatSessionsKey = getChatSessionsKey(currentUserId);
    const currentChatKey = getCurrentChatKey(currentUserId);
    
    const savedSessions = localStorage.getItem(chatSessionsKey);
    const savedCurrentChatId = localStorage.getItem(currentChatKey);
    
    console.log('📚 Loading chat sessions:', { 
      userId: currentUserId,
      isAnonymous,
      chatSessionsKey,
      hasSavedSessions: !!savedSessions 
    });
    
    // Load saved chat sessions for this user (anonymous or authenticated)
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map((session) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastActivity: new Date(session.lastActivity),
          messages: session.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(parsedSessions);
        
        // Load current chat or create new one
        if (savedCurrentChatId && parsedSessions.find((s) => s.id === savedCurrentChatId)) {
          const currentSession = parsedSessions.find((s) => s.id === savedCurrentChatId);
          setCurrentChatId(savedCurrentChatId);
          setMessages(currentSession.messages);
          setMessageIdCounter(currentSession.messages.length);
        } else if (parsedSessions.length > 0) {
          const latestSession = parsedSessions[0];
          setCurrentChatId(latestSession.id);
          setMessages(latestSession.messages);
          setMessageIdCounter(latestSession.messages.length);
          localStorage.setItem(currentChatKey, latestSession.id);
        } else {
          createNewChat();
        }
      } catch (e) {
        console.error('Error parsing saved sessions:', e);
        createNewChat();
      }
    } else {
      console.log('📝 No saved sessions, creating new chat');
      createNewChat();
    }
  }, [currentUserId]);
  // Initialize token count and chat sessions
// useEffect(() => {
//   const today = new Date().toDateString();
  
//   // Load token data from localStorage
//   const savedTokens = localStorage.getItem('tokensUsedToday');
//   const savedDate = localStorage.getItem('lastResetDate');
//   const savedSessions = localStorage.getItem('chatSessions');
//   const savedCurrentChatId = localStorage.getItem('currentChatId');
  
//   console.log('Loading tokens:', { savedTokens, savedDate, today });
  
//   // Reset token count ONLY if it's actually a new day
   
//   if (savedDate === today && savedTokens) {
//     // Same day - preserve existing tokens
//     const tokenCount = parseInt(savedTokens, 10) || 0;
//     setTokensUsedToday(tokenCount);
//     setLastResetDate(savedDate);
//     console.log('Preserved tokens for same day:', tokenCount);
//   } else {
//     // New day or first time - reset tokens
//     console.log('Resetting tokens for new day or first load');
//     setTokensUsedToday(0);
//     setLastResetDate(today);
//     localStorage.setItem('tokensUsedToday', '0');
//     localStorage.setItem('lastResetDate', today);
//   }
  
//   // Load saved chat sessions
//   if (savedSessions) {
//     try {
//       const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
//         ...session,
//         createdAt: new Date(session.createdAt),
//         lastActivity: new Date(session.lastActivity),
//         messages: session.messages.map((msg: any) => ({
//           ...msg,
//           timestamp: new Date(msg.timestamp)
//         }))
//       }));
//       setChatSessions(parsedSessions);
      
//       // Load current chat or create new one
//       if (savedCurrentChatId && parsedSessions.find((s: any) => s.id === savedCurrentChatId)) {
//         const currentSession = parsedSessions.find((s: any) => s.id === savedCurrentChatId);
//         setCurrentChatId(savedCurrentChatId);
//         setMessages(currentSession.messages);
//         setMessageIdCounter(currentSession.messages.length);
//       } else if (parsedSessions.length > 0) {
//         const latestSession = parsedSessions[0];
//         setCurrentChatId(latestSession.id);
//         setMessages(latestSession.messages);
//         setMessageIdCounter(latestSession.messages.length);
//         localStorage.setItem('currentChatId', latestSession.id);
//       } else {
//         createNewChat();
//       }
//     } catch (e) {
//       console.error('Error parsing saved sessions:', e);
//       createNewChat();
//     }
//   } else {
//     createNewChat();
//   }
// }, []);


  // Update chat session when messages change
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      updateCurrentChatSession(messages);
    }
  }, [messages, currentChatId]);


  // Estimate token count for a string (approximation)
 const estimateTokenCount = (text) => {
    return Math.ceil(text.length / 4);
  };

  const hasEnoughTokens = (query) => {
    const estimatedTokens = estimateTokenCount(query);
    return (tokensUsedToday + estimatedTokens) <= (DAILY_TOKEN_LIMIT - TOKEN_BUFFER);
  };

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

 const callApi = async (query) => {
    // Both anonymous and authenticated users can use the chat
    console.log(`🤖 API call for ${isAnonymous ? 'anonymous' : 'authenticated'} user`);

    // Check token limit
    if (!hasEnoughTokens(query)) {
      alert(t('ecoAssist.errors.tokenLimitExceeded'));
      return;
    }

    const userMessageId = messageIdCounter;
    const aiMessageId = messageIdCounter + 1;
    setMessageIdCounter(prev => prev + 2);

    try {
      const userMessage = {
        id: userMessageId,
        type: 'user',
        content: query,
        timestamp: new Date(),
        tokenCount: estimateTokenCount(query)
      };
       
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      setInputValue('');

      // Update token count
      const newUserTokenCount = tokensUsedToday + userMessage.tokenCount;
      updateTokens(newUserTokenCount);

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
      const aiTokenCount = estimateTokenCount(cleanReply);

      const aiMessage = {
        id: aiMessageId,
        type: 'ai',
        content: cleanReply,
        timestamp: new Date(),
        tokenCount: aiTokenCount
      };

      if (sections.length && sections[0].tips.length) {
        aiMessage.title = sections[0].title;
        aiMessage.tips = sections[0].tips;
      }

      setMessages(prev => [...prev, aiMessage]);
      
      // Update token count with AI response
      const finalTokenCount = newUserTokenCount + aiTokenCount;
      updateTokens(finalTokenCount);
      
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: aiMessageId,
        type: 'ai',
        content: t('ecoAssist.errors.requestError'),
        timestamp: new Date(),
        tokenCount: 0
      };
      setMessages(prev => [...prev, errorMessage]);
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

  // Clear current chat history
  const clearCurrentChat = () => {
    setMessages([]);
    setMessageIdCounter(0);
    updateCurrentChatSession([]);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Show chat list view
  if (showChatList) {
    return (
      <div 
        className="min-h-screen" 
        style={{ 
          background: "linear-gradient(to right, var(--color-green-60), var(--color-green-60))",
          color: "var(--foreground)" 
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className={`w-2 h-2 rounded-full ${isAnonymous ? 'bg-orange-400' : 'bg-green-400'}`}></div>
      <span>{isAnonymous ? 'Anonymous Session' : 'Logged In'}</span>
      {isAnonymous && (
        <span className="text-orange-600 text-xs">
          (Data will be cleared on login)
        </span>
      )}
    </div>
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowChatList(false)}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">{t('ecoAssist.chatHistory')}</h2>
              </div>
              <button 
                onClick={createNewChat}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {
                  t('ecoAssist.newChat')
                }
              </button>
            </div>

            {/* Chat sessions list */}
            <div className="p-6">
              {chatSessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No chat sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatSessions.map((session) => (
                    <div 
                      key={session.id}
                      className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                        session.id === currentChatId ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => loadChatSession(session.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 truncate">
                            {session.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {session.messages.length} messages • {formatDate(session.lastActivity)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChatSession(session.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        background: "linear-gradient(to right, var(--color-green-60), var(--color-green-60))",
        color: "var(--foreground)" 
      }}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with token usage and chat controls */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowChatList(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                {t('ecoAssist.chatHistory')}
              </button>
              <button 
                onClick={createNewChat}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
   {
                  t('ecoAssist.newChat')
                }              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {t('ecoAssist.tokensUsed')}: {tokensUsedToday}/{DAILY_TOKEN_LIMIT}
              </div>
              {messages.length > 0 && (
                <button 
                  onClick={clearCurrentChat}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {t('ecoAssist.clearHistory')}
                </button>
              )}
            </div>
          </div>

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
                  className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-200"
                  rows={1}
                  style={{ minHeight: '48px' }}
                  disabled={tokensUsedToday >= DAILY_TOKEN_LIMIT}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping || tokensUsedToday >= DAILY_TOKEN_LIMIT}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${tokensUsedToday < DAILY_TOKEN_LIMIT ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {tokensUsedToday < DAILY_TOKEN_LIMIT 
                  ? t('ecoAssist.statusMessage')
                  : t('ecoAssist.tokenLimitReached')
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclingChatInterface;
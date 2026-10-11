import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MessageItem } from './components/MessageItem';
import { MessageInput } from './components/MessageInput';
import { KnowledgeModal } from './components/KnowledgeModal';
import { ChatMessage, Conversation, KnowledgeStatus } from './types';

export const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('kural_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Knowledge modal state
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [knowledgeStatus, setKnowledgeStatus] = useState<KnowledgeStatus | null>(null);

  // Chat input and loading state
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Conversations history state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('kural_conversations');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => {
    const saved = localStorage.getItem('kural_active_id');
    return saved || '';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apply theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kural_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kural_theme', 'light');
    }
  }, [isDark]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem('kural_conversations', JSON.stringify(conversations));
      if (activeConvId) {
        localStorage.setItem('kural_active_id', activeConvId);
      }
    } catch (e) {}
  }, [conversations, activeConvId]);

  // Fetch knowledge status on mount and interval
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Poll status every 15s to catch live file changes
    return () => clearInterval(interval);
  }, []);

  // Current active conversation messages
  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const currentMessages = activeConversation?.messages || [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isLoading]);

  // Start new chat
  const handleNewChat = () => {
    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
    setInput('');
    setSidebarOpen(false);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (activeConvId === id) {
      setActiveConvId(filtered[0]?.id || '');
    }
  };

  // Clear all chats
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      setConversations([]);
      setActiveConvId('');
    }
  };

  // Send message handler
  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    let convId = activeConvId;
    let updatedConvs = [...conversations];

    // Create new conversation if none active
    if (!convId || !updatedConvs.some((c) => c.id === convId)) {
      convId = `conv_${Date.now()}`;
      const title = textToSend.slice(0, 36) + (textToSend.length > 36 ? '...' : '');
      const newConv: Conversation = {
        id: convId,
        title,
        createdAt: Date.now(),
        messages: [],
      };
      updatedConvs = [newConv, ...updatedConvs];
      setActiveConvId(convId);
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    // Update messages in conversation
    const targetConv = updatedConvs.find((c) => c.id === convId);
    if (targetConv) {
      if (targetConv.messages.length === 0) {
        targetConv.title = textToSend.slice(0, 36) + (textToSend.length > 36 ? '...' : '');
      }
      targetConv.messages.push(userMessage);
    }

    setConversations([...updatedConvs]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = (targetConv?.messages || []).slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now(),
        provider: data.provider,
        sources: data.sources || [],
        detectedLanguage: data.detectedLanguage,
        isWebFallback: data.isWebFallback,
        attachment: data.attachment,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              messages: [...c.messages, assistantMessage],
            };
          }
          return c;
        })
      );

      // Refresh knowledge status in case file was edited
      fetchStatus();
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to connect to assistant.'}`,
        timestamp: Date.now(),
        error: true,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              messages: [...c.messages, errorMessage],
            };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={(id) => {
          setActiveConvId(id);
          setSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onClearAll={handleClearAll}
        knowledgeStatus={knowledgeStatus}
        onOpenKnowledgeModal={() => setKnowledgeModalOpen(true)}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-surface">
        {/* Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          knowledgeStatus={knowledgeStatus}
          onOpenKnowledgeModal={() => setKnowledgeModalOpen(true)}
        />

        {/* Message View Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          {currentMessages.length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={(prompt) => handleSend(prompt)}
              knowledgeSectionsCount={knowledgeStatus?.knowledgeFile?.sections?.length || 0}
            />
          ) : (
            <div className="max-w-3xl mx-auto">
              {currentMessages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start mb-6 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
                    </div>
                    <div
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-subtle)',
                      }}
                      className="px-4 py-3 rounded-2xl border text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 shadow-2xs"
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="ml-1 font-medium">Kongu Kural is retrieving evidence and formulating answer...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Composer */}
        <MessageInput
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          isLoading={isLoading}
        />
      </div>

      {/* Knowledge File & Model Details Modal */}
      <KnowledgeModal
        isOpen={knowledgeModalOpen}
        onClose={() => setKnowledgeModalOpen(false)}
        status={knowledgeStatus}
        onRefresh={fetchStatus}
      />
    </div>
  );
};

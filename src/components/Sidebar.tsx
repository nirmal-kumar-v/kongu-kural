import React from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  X,
  FileText,
  Key,
  Globe2,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Conversation, KnowledgeStatus } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  knowledgeStatus: KnowledgeStatus | null;
  onOpenKnowledgeModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAll,
  knowledgeStatus,
  onOpenKnowledgeModal,
}) => {
  const geminiKeys = knowledgeStatus?.providers?.gemini?.configuredKeysCount || 0;
  const groqKeys = knowledgeStatus?.providers?.groq?.configuredKeysCount || 0;
  const sectionsCount = knowledgeStatus?.knowledgeFile?.sections?.length || 0;
  const charsCount = knowledgeStatus?.knowledgeFile?.characters || 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-subtle)',
        }}
        className={`fixed md:static inset-y-0 left-0 w-72 border-r z-40 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={onNewChat}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold text-stone-900 dark:text-stone-100 hover:border-blue-500 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>New Conversation</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 ml-2 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Recent Chats
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-stone-400 dark:text-stone-500">
              No previous chats yet. Ask a question to get started!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  style={{
                    backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                    borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer border transition-all ${
                    isActive
                      ? 'text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-stone-400'}`} />
                    <span className="truncate">{conv.title || 'Conversation'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-600 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Live Knowledge Status Widget */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <div
            onClick={onOpenKnowledgeModal}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
            className="p-3 rounded-xl border text-xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>college-info.txt</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
              {sectionsCount} sections • {charsCount.toLocaleString()} chars
            </div>
            <div className="mt-1 text-[10px] text-stone-400 flex items-center justify-between">
              <span>Hot-reload enabled</span>
              <ChevronRight className="w-3 h-3 text-stone-400" />
            </div>
          </div>

          {/* Engine Key Status */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
            className="p-2.5 rounded-xl border text-[11px] text-stone-600 dark:text-stone-300 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3 h-3 text-amber-500" />
                Gemini Failover
              </span>
              <span className="font-semibold px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-[10px]">
                {geminiKeys} {geminiKeys === 1 ? 'Key' : 'Keys'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3 h-3 text-purple-500" />
                Groq Retrieval
              </span>
              <span className="font-semibold px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-[10px]">
                {groqKeys} {groqKeys === 1 ? 'Key' : 'Keys'}
              </span>
            </div>
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-3 h-3" />
                Live Web Fallback
              </span>
              <span className="font-semibold text-[10px]">Ready</span>
            </div>
          </div>

          {conversations.length > 0 && (
            <button
              onClick={onClearAll}
              className="w-full text-center py-1.5 text-[11px] font-medium text-stone-400 hover:text-red-500 transition-colors"
            >
              Clear Conversation History
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

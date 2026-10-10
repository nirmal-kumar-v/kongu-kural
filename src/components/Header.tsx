import React from 'react';
import { Menu, Plus, Moon, Sun, Database, Sparkles, Globe } from 'lucide-react';
import { KnowledgeStatus } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  knowledgeStatus: KnowledgeStatus | null;
  onOpenKnowledgeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  isDark,
  onToggleTheme,
  knowledgeStatus,
  onOpenKnowledgeModal,
}) => {
  const fileChars = knowledgeStatus?.knowledgeFile?.characters || 0;
  const sectionsCount = knowledgeStatus?.knowledgeFile?.sections?.length || 0;

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
      }}
      className="h-16 px-4 md:px-6 border-b flex items-center justify-between z-20 shrink-0"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-stone-600 dark:text-stone-300 md:hidden"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            style={{ backgroundColor: 'var(--accent-primary)' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight leading-none text-stone-900 dark:text-white">
                Kongu Kural
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                KEC AI
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              Multilingual Campus Intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Knowledge File Status Pill */}
        <button
          onClick={onOpenKnowledgeModal}
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium text-stone-700 dark:text-stone-300 hover:border-blue-500 transition-colors"
          title="Click to view Knowledge File details and hot-reload status"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
          <Database className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
          <span>college-info.txt</span>
          <span className="text-stone-400 dark:text-stone-500">•</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {sectionsCount} {sectionsCount === 1 ? 'section' : 'sections'}
          </span>
        </button>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-stone-800 dark:text-stone-200 hover:border-stone-400 transition-colors"
          title="Start a new conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
          className="p-2 rounded-lg border text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle color theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
        </button>
      </div>
    </header>
  );
};

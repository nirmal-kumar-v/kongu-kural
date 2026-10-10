import React, { useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, Loader2 } from 'lucide-react';

interface MessageInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-strong)',
        }}
        className="relative rounded-2xl border shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all p-2.5"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about KEC (in தமிழ், English, or Tanglish)..."
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent resize-none outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-[14.5px] leading-relaxed px-2 py-1 max-h-44 disabled:opacity-60"
        />

        <div className="flex items-center justify-between mt-2 pt-1 border-t px-1" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Enter sends • Shift + Enter new line</span>
          </div>

          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            style={{
              backgroundColor: input.trim() && !isLoading ? 'var(--accent-primary)' : 'var(--bg-subtle)',
              color: input.trim() && !isLoading ? '#ffffff' : 'var(--text-muted)',
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed hover:opacity-90"
            title="Send Message"
            aria-label="Send Message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
      <p className="text-center text-[11px] text-stone-400 dark:text-stone-500 mt-2">
        Kongu Kural answers from <code className="font-semibold">college-info.txt</code> with live web search fallback.
      </p>
    </div>
  );
};

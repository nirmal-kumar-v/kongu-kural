import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  FileText,
  Globe,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [liked, setLiked] = useState<boolean | null>(null);

  const isUser = message.role === 'user';

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text to speech handler (supports Tamil, English, etc.)
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown symbols for cleaner speech
    const cleanText = message.content
      .replace(/[*#_`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    if (message.detectedLanguage === 'Tamil') {
      const tamilVoice = voices.find((v) => v.lang.startsWith('ta'));
      if (tamilVoice) utterance.voice = tamilVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-5 animate-fade-in">
        <div className="max-w-[85%] sm:max-w-[75%] flex items-start gap-2.5">
          <div
            style={{
              backgroundColor: 'var(--user-bubble)',
              borderColor: 'var(--border-subtle)',
            }}
            className="rounded-2xl px-4 py-3 border text-stone-900 dark:text-stone-100 text-[14.5px] leading-relaxed shadow-2xs whitespace-pre-wrap break-words"
          >
            {message.content}
          </div>
          <div
            style={{ backgroundColor: 'var(--bg-subtle)' }}
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-stone-600 dark:text-stone-300 mt-1"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex justify-start mb-6 animate-fade-in">
      <div className="max-w-full sm:max-w-[92%] flex items-start gap-3 w-full">
        {/* Assistant Avatar */}
        <div
          style={{ backgroundColor: 'var(--accent-primary)' }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-1 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>

        {/* Assistant Content Box */}
        <div className="flex-1 min-w-0">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Kongu Kural
            </span>

            {message.provider && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                {message.provider}
              </span>
            )}

            {message.detectedLanguage && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                {message.detectedLanguage}
              </span>
            )}

            {message.isWebFallback && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Live Web Search
              </span>
            )}
          </div>

          {/* Main Markdown Text */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
            className="rounded-2xl p-4 md:p-5 border shadow-2xs text-stone-800 dark:text-stone-200"
          >
            {message.error ? (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message.content}</span>
              </div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Source Citations Section */}
            {message.sources && message.sources.length > 0 && (
              <div
                className="mt-4 pt-3.5 border-t text-xs"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="flex items-center justify-between font-semibold text-stone-700 dark:text-stone-300 cursor-pointer select-none mb-2"
                >
                  <div className="flex items-center gap-1.5">
                    {message.isWebFallback ? (
                      <Globe className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>
                      {message.isWebFallback ? 'Live Web Citations' : 'Knowledge Citations'} ({message.sources.length})
                    </span>
                  </div>
                  <button className="text-stone-400 hover:text-stone-600 p-0.5">
                    {sourcesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {sourcesOpen && (
                  <div className="space-y-1.5 pt-1">
                    {message.sources.map((src, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          borderColor: 'var(--border-subtle)',
                        }}
                        className="p-2.5 rounded-xl border text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                            {src.title}
                          </span>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium ml-2 shrink-0"
                            >
                              <span>View Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {src.snippet && (
                          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                            {src.snippet}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Assistant Action Bar */}
            <div
              className="mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs text-stone-400 dark:text-stone-500"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex items-center gap-1 text-[11px]"
                  title="Copy answer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleSpeak}
                  className={`p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-[11px] ${
                    isSpeaking ? 'text-blue-600 font-semibold' : 'hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                  title="Read aloud"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLiked(liked === true ? null : true)}
                  className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${
                    liked === true ? 'text-emerald-500' : 'hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLiked(liked === false ? null : false)}
                  className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${
                    liked === false ? 'text-red-500' : 'hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

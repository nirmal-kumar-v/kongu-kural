import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Globe, Key, RefreshCw, Zap } from 'lucide-react';
import { KnowledgeStatus } from '../types';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: KnowledgeStatus | null;
  onRefresh: () => void;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const sections = status?.knowledgeFile?.sections || [];
  const chars = status?.knowledgeFile?.characters || 0;
  const geminiKeys = status?.providers?.gemini?.configuredKeysCount || 0;
  const groqKeys = status?.providers?.groq?.configuredKeysCount || 0;
  const lastMod = status?.knowledgeFile?.lastModified
    ? new Date(status.knowledgeFile.lastModified).toLocaleTimeString()
    : 'Active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-strong)',
        }}
        className="w-full max-w-xl rounded-2xl border shadow-xl p-5 md:p-6 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 p-0.5 border border-stone-200/80 dark:border-stone-700 shadow-2xs flex items-center justify-center shrink-0">
              <img
                src="/kec-logo.png"
                alt="KEC Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Knowledge System Architecture
              </h3>
              <p className="text-xs text-stone-500">
                Real-time hot-reloading & fallback pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* File Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
            className="p-4 rounded-xl border space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  college-info.txt
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Hot-Reload Active
                </span>
              </div>
              <button
                onClick={onRefresh}
                className="text-[11px] text-stone-500 hover:text-blue-600 flex items-center gap-1"
                title="Force refresh status"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              Located at the <strong>Project Root</strong>. Whenever you paste or modify text in VS Code and save, the backend instantly detects the timestamp change and updates search indexes without restarting the server.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-stone-500 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                Chars: <span className="font-semibold text-stone-800 dark:text-stone-200">{chars.toLocaleString()}</span>
              </div>
              <div>
                Sections: <span className="font-semibold text-stone-800 dark:text-stone-200">{sections.length}</span>
              </div>
              <div>
                Last sync: <span className="font-semibold text-stone-800 dark:text-stone-200">{lastMod}</span>
              </div>
            </div>
          </div>

          {/* Detected Sections in File */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Sections Detected in college-info.txt
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {sections.length === 0 ? (
                <span className="text-xs text-stone-400 italic">No sections detected yet.</span>
              ) : (
                sections.map((sec, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/50 dark:border-stone-700/50 font-medium"
                  >
                    {sec}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Engine Multi-Key Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Multi-Key Failover Status (.env)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)',
                }}
                className="p-3 rounded-xl border space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-stone-800 dark:text-stone-200">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    Gemini Answer Engine
                  </span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">
                    {geminiKeys} Key(s)
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Primary model for generating multilingual natural answers. Auto-rotates keys on quota exhaustion.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)',
                }}
                className="p-3 rounded-xl border space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-stone-800 dark:text-stone-200">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-500" />
                    Groq Semantic Engine
                  </span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded">
                    {groqKeys} Key(s)
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Understands user intent, cross-lingual context, and performs semantic passage ranking.
                </p>
              </div>
            </div>
          </div>

          {/* Web Fallback Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Automatic Web Search Fallback:</span>
              <p className="text-[11px] mt-0.5 text-amber-700 dark:text-amber-300/80">
                If a question cannot be answered from <code className="font-mono">college-info.txt</code>, Kongu Kural searches the live web for verified Kongu Engineering College information.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex justify-end" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

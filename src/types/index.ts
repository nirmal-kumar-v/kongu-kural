export interface SourceCitation {
  type: 'file' | 'web';
  title: string;
  url?: string;
  section?: string;
  snippet?: string;
}

export interface DownloadableAttachment {
  type: 'form' | 'document' | 'pdf';
  title: string;
  fileName: string;
  downloadUrl: string;
  fileSize?: string;
  description?: string;
  buttonLabel?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  provider?: string;
  sources?: SourceCitation[];
  detectedLanguage?: string;
  isWebFallback?: boolean;
  error?: boolean;
  attachment?: DownloadableAttachment;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface KnowledgeStatus {
  status: string;
  knowledgeFile: {
    path: string;
    exists: boolean;
    isEmpty: boolean;
    lastModified: number;
    characters: number;
    totalChunks: number;
    sections: string[];
  };
  providers: {
    gemini: {
      configuredKeysCount: number;
      model: string;
      ready: boolean;
    };
    groq: {
      configuredKeysCount: number;
      model: string;
      ready: boolean;
    };
  };
}

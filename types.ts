
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  image?: string;
  video?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface AppState {
  isSidebarOpen: boolean;
  activeView: 'chat' | 'dashboard' | 'settings' | 'logs';
  creatorName: string;
}

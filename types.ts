

export interface Chapter {
  time: string;
  description: string;
}

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface ScriptChunk {
  content: string;
  keyword: string;
}

export interface Script {
  id: string;
  title: string; // This is the Project Name
  aiTitle?: string; // This is the AI-generated title
  summary: string;
  script: string;
  timeline: Chapter[];
  createdAt: string;
  folderId?: string | null;
  splitScript?: ScriptChunk[];

  // New fields for editor state restoration
  mode?: 'generate' | 'rewrite' | 'keyword';
  ideaPrompt?: string;
  generatedOutline?: string;
  scriptPrompt?: string;
  originalScript?: string;
}

export interface Toast {
  id: string;
  message: string;
}

export interface RewriteStyle {
  id: string;
  name: string;
  prompt: string;
}

export interface KeywordStyle {
  id: string;
  name: string;
  prompt: string;
}
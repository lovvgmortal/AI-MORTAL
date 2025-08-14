import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Script, Chapter, ScriptChunk } from '../types';
import type { Database, Json } from '../lib/database.types';

type ScriptsTableRow = Database['public']['Tables']['scripts']['Row'];
type ScriptsTableInsert = Database['public']['Tables']['scripts']['Insert'];
type ScriptsTableUpdate = Database['public']['Tables']['scripts']['Update'];

interface ScriptsContextType {
  scripts: Script[];
  addScript: (script: Partial<Omit<Script, 'id' | 'createdAt'>>) => Promise<Script>;
  updateScript: (id: string, data: Partial<Omit<Script, 'id' | 'createdAt'>>) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  getScriptById: (id: string) => Script | undefined;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  fetchScripts: () => Promise<void>;
}

const ScriptsContext = createContext<ScriptsContextType | undefined>(undefined);

export const ScriptsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const fetchScripts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('scripts')
      .select('id, created_at, title, ai_title, summary, script, timeline, split_script, folder_id, mode, idea_prompt, generated_outline, script_prompt, original_script')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scripts:', JSON.stringify(error, null, 2));
      setScripts([]);
    } else {
      const formattedScripts: Script[] = (data || []).map((d) => ({
        id: d.id,
        createdAt: new Date(d.created_at).toLocaleString('en-US'),
        title: d.title,
        aiTitle: d.ai_title ?? undefined,
        summary: d.summary,
        script: d.script,
        timeline: (d.timeline as unknown as Chapter[] | null) ?? [],
        splitScript: (d.split_script as unknown as ScriptChunk[] | null) ?? [],
        folderId: d.folder_id ?? null,
        mode: d.mode ?? undefined,
        ideaPrompt: d.idea_prompt ?? undefined,
        generatedOutline: d.generated_outline ?? undefined,
        scriptPrompt: d.script_prompt ?? undefined,
        originalScript: d.original_script ?? undefined,
      }));
      setScripts(formattedScripts);
    }
    setLoading(false);
  }, [user?.id]); // ✅ Chỉ phụ thuộc vào user.id

  useEffect(() => {
    if (user?.id) {
      fetchScripts();
    } else if (!authLoading) {
      setScripts([]);
      setLoading(false);
    }
  }, [user?.id, authLoading, fetchScripts]); // ✅ fetchScripts giờ stable

  const addScript = useCallback(async (scriptData: Partial<Omit<Script, 'id' | 'createdAt'>>): Promise<Script> => {
    if (!user?.id) throw new Error("User not authenticated");
    
    const newScriptDataForDb: ScriptsTableInsert = {
      user_id: user.id,
      title: scriptData.title ?? 'Untitled Script',
      ai_title: scriptData.aiTitle ?? null,
      summary: scriptData.summary ?? '',
      script: scriptData.script ?? '',
      timeline: (scriptData.timeline as unknown as Json) ?? null,
      split_script: (scriptData.splitScript as unknown as Json) ?? null,
      folder_id: scriptData.folderId ?? null,
      mode: scriptData.mode ?? null,
      idea_prompt: scriptData.ideaPrompt ?? null,
      generated_outline: scriptData.generatedOutline ?? null,
      script_prompt: scriptData.scriptPrompt ?? null,
      original_script: scriptData.originalScript ?? null,
    };
    
    const { data, error } = await supabase
      .from('scripts')
      .insert(newScriptDataForDb)
      .select('id, created_at, title, ai_title, summary, script, timeline, split_script, folder_id, mode, idea_prompt, generated_outline, script_prompt, original_script')
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to create script");
    
    const createdScript: Script = {
        id: data.id,
        createdAt: new Date(data.created_at).toLocaleString('en-US'),
        title: data.title,
        aiTitle: data.ai_title ?? undefined,
        summary: data.summary,
        script: data.script,
        timeline: (data.timeline as unknown as Chapter[] | null) ?? [],
        splitScript: (data.split_script as unknown as ScriptChunk[] | null) ?? [],
        folderId: data.folder_id ?? null,
        mode: data.mode ?? undefined,
        ideaPrompt: data.idea_prompt ?? undefined,
        generatedOutline: data.generated_outline ?? undefined,
        scriptPrompt: data.script_prompt ?? undefined,
        originalScript: data.original_script ?? undefined,
    };
    
    setScripts(prev => [createdScript, ...prev]);
    return createdScript;
  }, [user?.id]);

  const updateScript = useCallback(async (id: string, dataToUpdate: Partial<Omit<Script, 'id' | 'createdAt'>>) => {
    if (!user?.id) throw new Error("User not authenticated");
    
    const dataToUpdateForDb: ScriptsTableUpdate = {
        title: dataToUpdate.title,
        ai_title: dataToUpdate.aiTitle,
        summary: dataToUpdate.summary,
        script: dataToUpdate.script,
        timeline: (dataToUpdate.timeline as unknown as Json),
        split_script: (dataToUpdate.splitScript as unknown as Json),
        folder_id: dataToUpdate.folderId,
        mode: dataToUpdate.mode,
        idea_prompt: dataToUpdate.ideaPrompt,
        generated_outline: dataToUpdate.generatedOutline,
        script_prompt: dataToUpdate.scriptPrompt,
        original_script: dataToUpdate.originalScript,
    };

    const { error } = await supabase
      .from('scripts')
      .update(dataToUpdateForDb)
      .eq('id', id)
      .eq('user_id', user.id);
      
    if (error) throw error;

    setScripts(prevScripts => prevScripts.map(script => 
      script.id === id ? { ...script, ...dataToUpdate } : script
    ));
  }, [user?.id]);

  const deleteScript = useCallback(async (id: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    
    const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;

    setScripts(prevScripts => prevScripts.filter(script => script.id !== id));
  }, [user?.id]);
  
  const getScriptById = useCallback((id: string): Script | undefined => {
    return scripts.find(script => script.id === id);
  }, [scripts]);

  return (
    <ScriptsContext.Provider value={{ scripts, addScript, updateScript, deleteScript, getScriptById, loading, setLoading, fetchScripts }}>
      {children}
    </ScriptsContext.Provider>
  );
};

export const useScripts = (): ScriptsContextType => {
  const context = useContext(ScriptsContext);
  if (context === undefined) {
    throw new Error('useScripts must be used within a ScriptsProvider');
  }
  return context;
};

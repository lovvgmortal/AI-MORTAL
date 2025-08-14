import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Folder } from '../types';

interface FoldersContextType {
  folders: Folder[];
  addFolder: (name: string) => Promise<Folder>;
  updateFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  loading: boolean;
}

const FoldersContext = createContext<FoldersContextType | undefined>(undefined);

export const FoldersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const fetchFolders = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('folders')
      .select('id, created_at, user_id, name')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching folders:', JSON.stringify(error, null, 2));
      setFolders([]);
    } else {
      setFolders(data || []);
    }
    setLoading(false);
  }, [user?.id]); // ✅ Chỉ phụ thuộc vào user.id

  useEffect(() => {
    if (user?.id) {
      fetchFolders();
    } else if (!authLoading) {
      setFolders([]);
      setLoading(false);
    }
  }, [user?.id, authLoading, fetchFolders]); // ✅ fetchFolders giờ stable
     
  const addFolder = useCallback(async (name: string): Promise<Folder> => {
    if (!user?.id) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from('folders')
      .insert({ name, user_id: user.id })
      .select('id, created_at, user_id, name')
      .single();
       
    if (error) throw error;
    if (!data) throw new Error("Could not create folder.");

    setFolders(prev => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)));
    return data;
  }, [user?.id]);

  const updateFolder = useCallback(async (id: string, name: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    const { error } = await supabase
        .from('folders')
        .update({ name })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f).sort((a,b) => a.name.localeCompare(b.name)));
  }, [user?.id]);

  const deleteFolder = useCallback(async (id: string) => {
    if (!user?.id) throw new Error("User not authenticated");
       
    // This is a client-side cascade delete.
    // A database trigger or ON DELETE CASCADE constraint is generally preferred.

    // First, delete scripts associated with the folder.
    const { error: scriptDeleteError } = await supabase
      .from('scripts')
      .delete()
      .eq('user_id', user.id)
      .eq('folder_id', id);

    if (scriptDeleteError) {
      console.error("Error deleting scripts in folder:", scriptDeleteError);
      throw scriptDeleteError;
    }

    // Then, delete the folder itself.
    const { error: folderDeleteError } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
       
    if (folderDeleteError) {
        console.error("Error deleting folder:", folderDeleteError);
        throw folderDeleteError;
    }
       
    setFolders(prev => prev.filter(f => f.id !== id));
  }, [user?.id]);

  return (
    <FoldersContext.Provider value={{ folders, addFolder, updateFolder, deleteFolder, loading }}>
        {children}
    </FoldersContext.Provider>
  );
};

export const useFolders = (): FoldersContextType => {
  const context = useContext(FoldersContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FoldersProvider');
  }
  return context;
};

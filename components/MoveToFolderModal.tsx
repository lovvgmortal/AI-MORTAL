import React, { useState } from 'react';
import { Icon } from './Icon';
import { useFolders } from '../contexts/FoldersContext';
import { useScripts } from '../contexts/ScriptsContext';
import { useToast } from '../contexts/ToastContext';
import type { Script } from '../types';

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script;
}

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({ isOpen, onClose, script }) => {
  const { folders } = useFolders();
  const { updateScript } = useScripts();
  const { showToast } = useToast();

  const handleMove = async (folderId: string | null) => {
    try {
        await updateScript(script.id, { folderId });
        showToast(`Script moved successfully.`);
        onClose();
    } catch (err) {
        showToast('Failed to move script.');
        console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-text">Move Script</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text p-1 rounded-full">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-brand-text-secondary mb-4">Move "<span className="font-semibold">{script.title}</span>" to:</p>
        <div className="max-h-60 overflow-y-auto space-y-2">
            <button
                onClick={() => handleMove(null)}
                className="w-full text-left p-3 rounded-md transition-colors bg-brand-bg hover:bg-brand-primary/10 flex items-center gap-3"
            >
                <Icon name="dashboard" className="w-5 h-5 text-brand-text-secondary"/>
                <span>Dashboard (Root)</span>
            </button>
            {folders.map(folder => (
                <button
                    key={folder.id}
                    onClick={() => handleMove(folder.id)}
                    className="w-full text-left p-3 rounded-md transition-colors bg-brand-bg hover:bg-brand-primary/10 flex items-center gap-3"
                >
                    <Icon name="folder" className="w-5 h-5 text-brand-primary"/>
                    <span className="truncate">{folder.name}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

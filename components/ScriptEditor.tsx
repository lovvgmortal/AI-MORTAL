import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useScripts } from '../contexts/ScriptsContext';
import { useToast } from '../contexts/ToastContext';
import { useStyles } from '../contexts/StylesContext';
import { useAuth } from '../contexts/AuthContext';
import {
  generateTitleSummaryAndTimeline,
  rewriteScript,
  generateOutline,
  generateScriptFromOutline,
  generateKeywordsAndSplitScript,
  ProviderConfig,
} from '../services/geminiService';
import type { Chapter, KeywordStyle, ScriptChunk } from '../types';
import Spinner from './Spinner';
import { Icon } from './Icon';
import { SaveModal } from './SaveModal';
import { StyleManagerModal } from './StyleManagerModal';
import { CustomSelect } from './CustomSelect';
import { KeywordStyleManagerModal } from './KeywordStyleManagerModal';
import { useKeywordStyles } from '../contexts/KeywordStylesContext';

type Mode = 'rewrite' | 'generate' | 'keyword';

interface ResultState {
    aiTitle: string;
    summary: string;
    script: string;
    timeline: Chapter[];
    splitScript: ScriptChunk[];
}

export const ScriptEditor: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [originalScript, setOriginalScript] = useState('');
  
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [generatedOutline, setGeneratedOutline] = useState('');
  const [scriptPrompt, setScriptPrompt] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Partial<ResultState> | null>(null);

  const [isGenerating, setIsGenerating] = useState(false); // For main AI script/outline generation
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false); // For title/summary/timeline
  const [isSaving, setIsSaving] = useState(false); // For DB calls

  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isStyleManagerOpen, setStyleManagerOpen] = useState(false);
  const [isKeywordStyleManagerOpen, setKeywordStyleManagerOpen] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('default');
  const [selectedKeywordStyleId, setSelectedKeywordStyleId] = useState<string>('default');
  const [isEditingAiTitle, setIsEditingAiTitle] = useState(false);

  const { scriptId } = useParams<{ scriptId: string }>();
  const { addScript, updateScript, getScriptById, loading } = useScripts();
  const { showToast } = useToast();
  const { styles } = useStyles();
  const { keywordStyles } = useKeywordStyles();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const script = scriptId ? getScriptById(scriptId) : null;

  const handleClear = (isNewSession = false) => {
    setOriginalScript('');
    setIdeaPrompt('');
    setGeneratedOutline('');
    setScriptPrompt('');
    setResult(null);
    setError(null);
    if (scriptId && !isNewSession) {
      navigate('/edit', { replace: true });
    }
  };

  const getProviderConfig = (): ProviderConfig => {
      const geminiApiKey = profile?.gemini_api_key;
      const openRouterApiKey = profile?.openrouter_api_key;
      const primaryProvider = profile?.primary_provider || 'gemini';
      if (!geminiApiKey && primaryProvider === 'gemini') {
          throw new Error("Your primary provider is Gemini, but the API key is not set. Please update it in Settings.");
      }
      if (!openRouterApiKey && (primaryProvider === 'openrouter' || !geminiApiKey)) {
          throw new Error("OpenRouter API key is not set, which is required as a primary or fallback provider. Please update it in Settings.");
      }
      return { geminiApiKey, openRouterApiKey, primaryProvider };
  };

  useEffect(() => {
    if (scriptId) {
      const scriptToEdit = getScriptById(scriptId);
      if (scriptToEdit) {
        setMode(scriptToEdit.mode || 'generate');
        setIdeaPrompt(scriptToEdit.ideaPrompt || '');
        setGeneratedOutline(scriptToEdit.generatedOutline || '');
        setScriptPrompt(scriptToEdit.scriptPrompt || '');
        setOriginalScript(scriptToEdit.originalScript || scriptToEdit.script || '');
        
        if (scriptToEdit.script || scriptToEdit.aiTitle || scriptToEdit.splitScript?.length) {
            setResult({
              aiTitle: scriptToEdit.aiTitle || scriptToEdit.title,
              summary: scriptToEdit.summary,
              script: scriptToEdit.script,
              timeline: scriptToEdit.timeline,
              splitScript: scriptToEdit.splitScript || [],
            });
        } else {
            setResult(null);
        }
        setError(null);
      } else if (!loading) { // Check loading state to avoid false "not found"
        setError(`Script with ID "${scriptId}" not found.`);
        navigate('/edit', { replace: true });
      }
    } else {
      handleClear(true);
    }
  }, [scriptId, getScriptById, navigate, loading]);


  const handleSaveOrUpdate = async () => {
    try {
        setIsSaving(true);
        if (scriptId) {
            const scriptData = getScriptById(scriptId);
            const dataToSave = {
                title: scriptData?.title || 'Untitled Script',
                aiTitle: result?.aiTitle || scriptData?.aiTitle || scriptData?.title,
                summary: result?.summary || '',
                script: result?.script || originalScript,
                timeline: result?.timeline || [],
                splitScript: result?.splitScript || [],
                mode,
                ideaPrompt,
                generatedOutline,
                scriptPrompt,
                originalScript,
            };
            await updateScript(scriptId, dataToSave);
            showToast('Script updated successfully!');
        } else {
            setSaveModalOpen(true);
        }
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        showToast(errorMessage);
    } finally {
        setIsSaving(false);
    }
  };

  const handleConfirmSave = async (title: string, folderId: string | null) => {
    try {
        setIsSaving(true);
        const dataToSave = {
            title,
            aiTitle: result?.aiTitle || title,
            summary: result?.summary || '',
            script: result?.script || originalScript,
            timeline: result?.timeline || [],
            splitScript: result?.splitScript || [],
            folderId,
            mode,
            ideaPrompt,
            generatedOutline,
            scriptPrompt,
            originalScript,
        };

        const newScript = await addScript(dataToSave);
        setSaveModalOpen(false);
        navigate(`/edit/${newScript.id}`, { replace: true });
        showToast('Script saved successfully!');
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        showToast(errorMessage);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleRewrite = async () => {
    if (!originalScript) {
      setError("Please enter the script to rewrite.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setResult(null);
    try {
      const providerConfig = getProviderConfig();
      const selectedStyle = styles.find(s => s.id === selectedStyleId);
      const stylePrompt = selectedStyle?.prompt;
      const rewritten = await rewriteScript(providerConfig, originalScript, stylePrompt);
      const scriptData = scriptId ? getScriptById(scriptId) : null;

      setResult({ 
        script: rewritten,
        aiTitle: scriptData?.aiTitle || 'Rewritten Script',
        summary: scriptData?.summary || '',
        timeline: scriptData?.timeline || [],
        splitScript: scriptData?.splitScript || [],
       });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateKeywords = async () => {
    if (!originalScript) {
      setError("Please enter the script to generate keywords from.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setResult(null);
    try {
      const providerConfig = getProviderConfig();
      const selectedStyle = keywordStyles.find(s => s.id === selectedKeywordStyleId);
      const stylePrompt = selectedStyle?.prompt;
      const analyzedChunks = await generateKeywordsAndSplitScript(providerConfig, originalScript, stylePrompt);
      
      const scriptData = scriptId ? getScriptById(scriptId) : null;
      setResult({
        script: originalScript,
        aiTitle: scriptData?.aiTitle || 'Script Analysis',
        summary: scriptData?.summary || '',
        timeline: scriptData?.timeline || [],
        splitScript: analyzedChunks,
      })

    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateOutline = async () => {
    if (!ideaPrompt) {
      setError("Please enter an idea to generate an outline.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedOutline('');
    try {
      const providerConfig = getProviderConfig();
      const outline = await generateOutline(providerConfig, ideaPrompt);
      setGeneratedOutline(outline);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while generating the outline.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!scriptPrompt || !generatedOutline) {
      setError("Please generate an outline and provide instructions to write the script.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setResult(null);
    try {
      const providerConfig = getProviderConfig();
      const finalScript = await generateScriptFromOutline(providerConfig, generatedOutline, scriptPrompt);
      setResult({ 
        script: finalScript,
        aiTitle: 'AI Generated Script',
        summary: '',
        timeline: [],
        splitScript: [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while generating the script.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDetails = async () => {
    if (!result || !result.script) return;

    setIsGeneratingDetails(true);
    setError(null);
    try {
        const providerConfig = getProviderConfig();
        const details = await generateTitleSummaryAndTimeline(providerConfig, result.script);
        setResult(prevResult => ({
            ...prevResult!,
            ...details,
        }));
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred while generating details.');
    } finally {
        setIsGeneratingDetails(false);
    }
  };

  const handleCopy = (content: string, type: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
        showToast(`${type} copied to clipboard!`);
    }).catch(err => {
        console.error(`Failed to copy ${type}:`, err);
        setError(`Failed to copy ${type} to clipboard.`);
    });
  };

  const renderInputs = () => {
    if (mode === 'rewrite') {
      return (
        <div className="flex flex-col h-full space-y-4">
          <div>
              <label htmlFor="rewriteStyle" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Rewrite Style
              </label>
              <div className="flex gap-2">
                <CustomSelect
                  value={selectedStyleId}
                  onChange={setSelectedStyleId}
                  options={[
                    { value: 'default', label: 'Default Style' },
                    ...styles.map((style) => ({ value: style.id, label: style.name })),
                  ]}
                />
                <button 
                  onClick={() => setStyleManagerOpen(true)}
                  className="flex-shrink-0 border border-brand-secondary text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  Manage Styles
                </button>
              </div>
          </div>
          <div className="flex flex-col flex-grow min-h-0">
            <label htmlFor="originalScript" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Paste the original script here</label>
            <textarea
              id="originalScript"
              value={originalScript}
              onChange={(e) => setOriginalScript(e.target.value)}
              className="w-full bg-brand-bg border border-brand-surface rounded-md p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition flex-grow resize-none"
              placeholder="Example: Scene 1. Interior. Coffee Shop - Day..."
            />
          </div>
          <button onClick={handleRewrite} disabled={isGenerating} className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            <Icon name="sparkles" />
            Rewrite Script
          </button>
        </div>
      );
    }

    if (mode === 'keyword') {
      return (
        <div className="flex flex-col h-full space-y-4">
          <div>
              <label htmlFor="keywordStyle" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Analysis & Split Style
              </label>
              <div className="flex gap-2">
                <CustomSelect
                  value={selectedKeywordStyleId}
                  onChange={setSelectedKeywordStyleId}
                  options={[
                    { value: 'default', label: 'Default Analysis' },
                    ...keywordStyles.map((style) => ({ value: style.id, label: style.name })),
                  ]}
                />
                <button 
                  onClick={() => setKeywordStyleManagerOpen(true)}
                  className="flex-shrink-0 border border-brand-secondary text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  Manage Styles
                </button>
              </div>
          </div>
          <div className="flex flex-col flex-grow min-h-0">
            <label htmlFor="originalScript" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Paste the script to analyze</label>
            <textarea
              id="originalScript"
              value={originalScript}
              onChange={(e) => setOriginalScript(e.target.value)}
              className="w-full bg-brand-bg border border-brand-surface rounded-md p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition flex-grow resize-none"
              placeholder="Paste your script to split it and extract keywords for each section..."
            />
          </div>
          <button onClick={handleGenerateKeywords} disabled={isGenerating || !originalScript} className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            <Icon name="tag" />
            Analyze Script
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="flex-1 flex flex-col min-h-0">
          <label htmlFor="ideaPrompt" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Step 1: Enter Your Main Idea</label>
          <textarea
            id="ideaPrompt"
            value={ideaPrompt}
            onChange={(e) => setIdeaPrompt(e.target.value)}
            className="w-full bg-brand-bg border border-brand-surface rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-none flex-grow"
            placeholder="Example: A military analyst with 20 years of experience..."
          />
          <button onClick={handleGenerateOutline} disabled={isGenerating || !ideaPrompt} className="mt-2 w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            <Icon name="sparkles" />
            {generatedOutline ? 'Regenerate Outline' : 'Generate Outline'}
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Generated Outline (Editable):</h3>
          <div className="bg-brand-bg/50 rounded-md border border-brand-surface flex-grow flex flex-col">
            <textarea
              value={generatedOutline}
              onChange={(e) => setGeneratedOutline(e.target.value)}
              className="w-full h-full bg-transparent p-3 font-sans text-brand-text text-sm focus:outline-none resize-none"
              placeholder="AI will generate the outline here. You can edit it directly."
              disabled={isGenerating && !generatedOutline}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <label htmlFor="scriptPrompt" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Step 2: Provide Detailed Instructions</label>
          <textarea
            id="scriptPrompt"
            value={scriptPrompt}
            onChange={(e) => setScriptPrompt(e.target.value)}
            className="w-full bg-brand-bg border border-brand-surface rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition disabled:opacity-50 disabled:cursor-not-allowed resize-none flex-grow"
            placeholder="Example: Write in a thrilling, action-packed style..."
            disabled={!generatedOutline || isGenerating}
          />
          <button onClick={handleGenerateScript} disabled={isGenerating || !generatedOutline || !scriptPrompt} className="mt-2 w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            <Icon name="edit" />
            {result?.script ? 'Regenerate Full Script' : 'Generate Full Script'}
          </button>
        </div>
      </div>
    );
  };
  
  const renderResult = () => {
    if (mode === 'keyword') {
      if (isGenerating && !result) return <div className="flex-grow flex items-center justify-center"><Spinner /></div>;
      if (error && !result) return <div className="text-brand-text bg-brand-surface border border-brand-secondary p-4 rounded-md">{error}</div>;
      if (!result || !result.splitScript?.length) {
        return <div className="flex-grow flex items-center justify-center text-center text-brand-text-secondary p-8">The script analysis table will be displayed here.</div>;
      }

      return (
        <div className="space-y-4 h-full flex flex-col">
          <h2 className="text-2xl font-bold text-brand-text flex-shrink-0 pb-3 border-b border-brand-surface">Script Analysis</h2>
          {error && <div className="text-red-700 bg-red-100 border border-red-200 p-2 rounded-md text-sm flex-shrink-0 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/50">{error}</div>}

          <div className="flex-grow overflow-auto">
            <table className="w-full text-sm text-left text-brand-text-secondary">
              <thead className="text-xs text-brand-text uppercase bg-brand-bg sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 w-16">Index</th>
                  <th scope="col" className="px-6 py-3">Content</th>
                  <th scope="col" className="px-6 py-3 w-48">Keyword</th>
                </tr>
              </thead>
              <tbody>
                {result.splitScript.map((chunk, index) => (
                  <tr key={index} className="bg-brand-surface border-b border-brand-bg hover:bg-brand-bg/30">
                    <td className="px-6 py-4 font-medium text-brand-text text-center">{index + 1}</td>
                    <td className="px-6 py-4">{chunk.content}</td>
                    <td className="px-6 py-4">
                      <span className="text-brand-primary font-medium text-xs">
                        {chunk.keyword}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    if (isGenerating && !result) return <div className="flex-grow flex items-center justify-center"><Spinner /></div>;
    if (error && !result) return <div className="text-brand-text bg-brand-surface border border-brand-secondary p-4 rounded-md">{error}</div>;
    if (!result) return <div className="flex-grow flex items-center justify-center text-center text-brand-text-secondary p-8">The result will be displayed here.</div>;
    
    const wordCount = result.script ? result.script.trim().split(/\s+/).filter(Boolean).length : 0;

    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-start gap-4 flex-shrink-0 pb-3 border-b border-brand-surface">
            {isEditingAiTitle ? (
                <input
                    type="text"
                    value={result.aiTitle || ''}
                    onChange={(e) => setResult(prev => prev ? { ...prev, aiTitle: e.target.value } : null)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingAiTitle(false); }}
                    onBlur={() => setIsEditingAiTitle(false)}
                    className="text-2xl font-bold bg-brand-bg text-brand-text w-full p-1 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none flex-grow"
                    autoFocus
                />
            ) : (
                <h2 
                    className="text-2xl font-bold text-brand-text flex-grow cursor-pointer hover:bg-brand-bg/50 p-1 -m-1 rounded-md transition-colors"
                    onClick={() => setIsEditingAiTitle(true)}
                    title="Click to edit title"
                >
                    {result.aiTitle || 'AI Generated Title'}
                </h2>
            )}
            <div className="flex flex-col gap-2 w-44 flex-shrink-0">
                 <button 
                    onClick={handleGenerateDetails}
                    disabled={isGenerating || isGeneratingDetails || !result.script}
                    className="flex-shrink-0 flex items-center justify-center gap-2 border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-text-inverse font-bold py-2 px-3 rounded-lg transition-colors disabled:opacity-50 text-sm"
                 >
                  {isGeneratingDetails ? (
                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin"></div>
                  ) : (
                    <Icon name="sparkles" className="w-4 h-4" />
                  )}
                  <span>{isGeneratingDetails ? 'Generating...' : 'Details'}</span>
                </button>
            </div>
        </div>

        {error && <div className="text-red-700 bg-red-100 border border-red-200 p-2 rounded-md text-sm flex-shrink-0 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/50">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
            <div className="space-y-2 flex flex-col">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-brand-text">Summary</h3>
                    <button
                        onClick={() => handleCopy(result.summary || '', 'Summary')}
                        disabled={!result.summary}
                        className="text-brand-text-secondary hover:text-brand-text transition-colors p-1 disabled:opacity-50"
                        aria-label="Copy summary"
                    >
                      <Icon name="copy" className="w-4 h-4"/>
                    </button>
                </div>
                 <div className="bg-brand-bg/50 rounded-md p-3 flex-grow flex flex-col">
                    {isGeneratingDetails && !result.summary ? (
                       <div className="flex-grow flex items-center justify-center">
                            <p className="text-brand-text-secondary text-sm">Generating summary...</p>
                        </div>
                    ) : result.summary ? (
                        <p className="text-brand-text-secondary text-sm leading-relaxed overflow-y-auto pr-1">{result.summary}</p>
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                            <p className="text-brand-text-secondary text-sm">Summary will be generated here.</p>
                        </div>
                    )}
                </div>
            </div>
             <div className="space-y-2 flex flex-col">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-brand-text">Timeline</h3>
                    <button
                        onClick={() => {
                            const timelineText = result.timeline?.map(ch => `${ch.time} – ${ch.description}`).join('\n') || '';
                            handleCopy(timelineText, 'Timeline');
                        }}
                        disabled={!result.timeline || result.timeline.length === 0}
                        className="text-brand-text-secondary hover:text-brand-text transition-colors p-1 disabled:opacity-50"
                        aria-label="Copy timeline"
                    >
                      <Icon name="copy" className="w-4 h-4"/>
                    </button>
                </div>
                <div className="bg-brand-bg/50 rounded-md p-2 flex-grow flex flex-col">
                    {isGeneratingDetails && (!result.timeline || result.timeline.length === 0) ? (
                        <div className="flex-grow flex items-center justify-center">
                           <p className="text-brand-text-secondary text-sm">Generating timeline...</p>
                        </div>
                    ) : result.timeline && result.timeline.length > 0 ? (
                        <ul className="space-y-1.5 overflow-y-auto pr-2">
                            {result.timeline.map((chapter, index) => (
                            <li key={index} className="flex gap-4 p-1.5 rounded-md text-sm">
                                <span className="font-semibold text-brand-primary w-16 text-right flex-shrink-0">{chapter.time}</span>
                                <span className="text-brand-text-secondary">{chapter.description}</span>
                            </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                           <p className="text-brand-text-secondary text-sm">Timeline will be generated here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="flex-grow flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2 text-brand-text border-b border-brand-surface pb-1.5 flex-shrink-0 pr-2">
            <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Script Content (Editable)</h3>
                <span className="text-xs font-mono text-brand-text-secondary bg-brand-bg px-2 py-0.5 rounded-full">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
            </div>
            <button onClick={() => handleCopy(result.script || '', 'Script')} className="flex items-center gap-1.5 text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
              <Icon name="copy" className="w-4 h-4"/>
              Copy
            </button>
          </div>
          <div className="bg-brand-bg/50 rounded-md overflow-hidden flex-grow flex">
            {isGenerating ? <div className="w-full h-full flex items-center justify-center"><Spinner/></div> : 
            <textarea 
                className="w-full h-full bg-transparent p-3 font-mono text-sm text-brand-text focus:outline-none resize-none"
                value={result.script || ''}
                onChange={(e) => setResult(prev => prev ? ({...prev, script: e.target.value}) : null)}
                placeholder="The final script will appear here. You can edit it directly."
            />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-2">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        
        <div className="bg-brand-surface p-4 rounded-lg shadow-lg flex flex-col h-[calc(100vh-6rem)]">
          <div className="flex-shrink-0 border-b border-brand-surface pb-4 mb-4">
            <div className="flex items-center">
              <div className="flex-grow flex items-center gap-4">
                <h2 className="text-xl font-bold text-brand-text truncate" title={script?.title}>
                    {script?.title || 'New Script'}
                </h2>
                <div className="flex-grow">
                    <button onClick={() => setMode('generate')} className={`px-4 py-2 text-sm font-medium ${mode === 'generate' ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-text-secondary'}`}>Generate</button>
                    <button onClick={() => setMode('rewrite')} className={`px-4 py-2 text-sm font-medium ${mode === 'rewrite' ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-text-secondary'}`}>Rewrite</button>
                    <button onClick={() => setMode('keyword')} className={`px-4 py-2 text-sm font-medium ${mode === 'keyword' ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-text-secondary'}`}>Keyword</button>
                </div>
              </div>
              
              <button onClick={handleSaveOrUpdate} disabled={isSaving || isGenerating || isGeneratingDetails} className="text-brand-text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5 px-3 disabled:opacity-50">
                <Icon name="save" className="w-4 h-4"/>
                {scriptId ? 'Update' : 'Save'}
              </button>
              <button onClick={() => handleClear()} disabled={isSaving || isGenerating || isGeneratingDetails} className="text-brand-text-secondary hover:text-brand-text transition-colors flex items-center gap-1.5 px-3">
                <Icon name="trash" className="w-4 h-4"/> Clear
              </button>
            </div>
          </div>
          <div className="flex-grow flex flex-col min-h-0">
            {renderInputs()}
          </div>
        </div>

        <div className="bg-brand-surface p-4 rounded-lg shadow-lg flex flex-col h-[calc(100vh-6rem)]">
          {renderResult()}
        </div>
      </div>
      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setSaveModalOpen(false)}
        onSave={handleConfirmSave}
        initialTitle={result?.aiTitle || (mode === 'keyword' ? 'Script Analysis' : 'New Project Name')}
      />
      <StyleManagerModal 
        isOpen={isStyleManagerOpen}
        onClose={() => setStyleManagerOpen(false)}
      />
      <KeywordStyleManagerModal
        isOpen={isKeywordStyleManagerOpen}
        onClose={() => setKeywordStyleManagerOpen(false)}
      />
    </div>
  );
};
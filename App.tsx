import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { generateOutline, generateChapterContent, generateMarketingImage, suggestImagePrompts } from './services/geminiService';
import { ViewState, EbookProject, Chapter, GeneratedImage, Language } from './types';
import { translations } from './translations';
import { Wand2, Loader2, Save, Send, ImagePlus, Download, RefreshCw, LayoutTemplate, PenTool, ChevronRight, Languages, Key, FileText, Eye, ArrowRight } from 'lucide-react';

// Utility to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Check if ENV key exists
const envApiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';

// STORAGE KEYS
const STORAGE_KEY_PROJECT = 'ebookgen_project';
const STORAGE_KEY_API = 'gemini_api_key';
const STORAGE_KEY_VIEW = 'ebookgen_view';

export default function App() {
  // --- STATE MANAGEMENT ---
  
  // Load Project from Storage or Default
  const [project, setProject] = useState<EbookProject>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY_PROJECT);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load saved project", e);
            }
        }
    }
    return {
        businessName: '',
        niche: '',
        targetAudience: '',
        chapters: [],
        images: []
    };
  });

  // Load View from Storage (so refresh stays on same page)
  const [view, setView] = useState<ViewState>(() => {
      if (typeof window !== 'undefined') {
          const savedView = localStorage.getItem(STORAGE_KEY_VIEW);
          if (savedView && Object.values(ViewState).includes(savedView as ViewState)) {
              // If project is empty, force onboarding regardless of saved view
              const savedProject = localStorage.getItem(STORAGE_KEY_PROJECT);
              if (!savedProject || JSON.parse(savedProject).chapters.length === 0) {
                  return ViewState.ONBOARDING;
              }
              return savedView as ViewState;
          }
      }
      return ViewState.ONBOARDING;
  });

  const [language, setLanguage] = useState<Language>('pt'); 
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // API Key State
  const [manualApiKey, setManualApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEY_API) || '';
    }
    return '';
  });

  // Image Generator State
  const [imagePrompt, setImagePrompt] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [activeImageTab, setActiveImageTab] = useState<'generate' | 'gallery'>('generate');

  // Translations
  const t = translations[language];

  // --- EFFECTS (PERSISTENCE) ---

  // Auto-save project
  useEffect(() => {
      if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_PROJECT, JSON.stringify(project));
      }
  }, [project]);

  // Auto-save view
  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_VIEW, view);
    }
  }, [view]);

  // --- HANDLERS ---

  const getApiKey = () => {
      if (envApiKey && envApiKey.length > 0) return envApiKey;
      return manualApiKey;
  };

  const handleManualKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setManualApiKey(val);
      localStorage.setItem(STORAGE_KEY_API, val);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pt' : 'en');
  };

  const handleResetProject = () => {
      const emptyProject = {
        businessName: '',
        niche: '',
        targetAudience: '',
        chapters: [],
        images: []
      };
      setProject(emptyProject);
      setView(ViewState.ONBOARDING);
      setSuggestedPrompts([]);
      setImagePrompt('');
      setCurrentChapterIndex(0);
      localStorage.removeItem(STORAGE_KEY_PROJECT);
  };

  const handleStartProject = async () => {
    if (!project.niche || !project.businessName) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
        alert(language === 'pt' ? "Por favor, insira sua Chave API Gemini." : "Please enter your Gemini API Key.");
        return;
    }

    setIsLoading(true);
    try {
      const outlineData = await generateOutline(project.niche, project.businessName, language, apiKey);
      const newChapters: Chapter[] = outlineData.map((item: any) => ({
        id: generateId(),
        title: item.title,
        description: item.description,
        isGenerating: false
      }));
      setProject(prev => ({ ...prev, chapters: newChapters }));
      // Automatically go to Outline view, then user can go to editor
      setView(ViewState.OUTLINE);
    } catch (error: any) {
      console.error("Start Project Error:", error);
      const errorMessage = error?.message || "Unknown error";
      const userMessage = language === 'pt' 
        ? `Falha ao gerar o esboço: ${errorMessage}.` 
        : `Failed to generate outline: ${errorMessage}.`;
      alert(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateChapter = async (index: number) => {
    const chapter = project.chapters[index];
    if (!chapter) return;

    const apiKey = getApiKey();
    if (!apiKey) {
        alert("API Key missing");
        return;
    }

    const updatedChapters = [...project.chapters];
    updatedChapters[index].isGenerating = true;
    setProject(prev => ({ ...prev, chapters: updatedChapters }));

    try {
      const content = await generateChapterContent(
        chapter.title,
        chapter.description,
        project.niche,
        project.businessName,
        language,
        apiKey
      );
      
      setProject(prev => {
        const newChapters = [...prev.chapters];
        newChapters[index].content = content;
        newChapters[index].isGenerating = false;
        return { ...prev, chapters: newChapters };
      });
    } catch (error: any) {
      console.error(error);
      setProject(prev => {
        const newChapters = [...prev.chapters];
        newChapters[index].isGenerating = false;
        return { ...prev, chapters: newChapters };
      });
      const errorMessage = error?.message || "Unknown error";
      alert(language === 'pt' ? `Erro ao gerar capítulo: ${errorMessage}` : `Error generating chapter: ${errorMessage}`);
    }
  };

  const handleChapterContentChange = (newContent: string) => {
    setProject(prev => {
        const newChapters = [...prev.chapters];
        newChapters[currentChapterIndex].content = newContent;
        return { ...prev, chapters: newChapters };
    });
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
        alert("API Key missing");
        return;
    }

    setIsLoading(true);
    try {
      const base64Image = await generateMarketingImage(imagePrompt, apiKey);
      const newImage: GeneratedImage = {
        id: generateId(),
        url: base64Image,
        prompt: imagePrompt,
        createdAt: Date.now()
      };
      setProject(prev => ({ ...prev, images: [newImage, ...prev.images] }));
      setImagePrompt('');
      setActiveImageTab('gallery');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || "Unknown error";
      alert(language === 'pt' ? `Falha ao gerar imagem: ${errorMessage}` : `Failed to generate image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetImageSuggestions = async () => {
      const currentChapter = project.chapters[currentChapterIndex];
      const title = currentChapter ? currentChapter.title : (language === 'pt' ? "Marketing Geral" : "General Marketing");
      
      const apiKey = getApiKey();
      if (!apiKey) return;

      setIsLoading(true);
      try {
          const suggestions = await suggestImagePrompts(project.niche, title, language, apiKey);
          setSuggestedPrompts(suggestions);
      } catch(e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  }

  // --- VIEW RENDERERS ---

  const renderOnboarding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-2xl mx-auto text-center animate-fade-in relative">
      <div className="absolute top-6 right-6">
        <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors border border-slate-700"
        >
            <Languages size={16} />
            <span className="font-semibold uppercase">{language}</span>
        </button>
      </div>

      <div className="bg-emerald-500/10 p-4 rounded-full mb-6">
        <Wand2 size={48} className="text-emerald-400" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">{t.onboarding.title}</h1>
      <p className="text-slate-400 mb-8 text-lg">
        {t.onboarding.subtitle}
      </p>
      
      <div className="w-full max-w-md space-y-4 text-left">
        {!envApiKey && (
             <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-500/20 mb-4 shadow-lg shadow-black/20">
                <label className="block text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Key size={12} />
                    {t.onboarding.apiKeyLabel}
                </label>
                <input 
                    type="password" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all text-sm"
                    placeholder={t.onboarding.apiKeyPlace}
                    value={manualApiKey}
                    onChange={handleManualKeyChange}
                />
                <p className="text-[10px] text-slate-500 mt-2">
                    {t.onboarding.apiKeyHelp}
                </p>
             </div>
        )}

        {/* If chapters exist, offer to continue */}
        {project.chapters.length > 0 && (
             <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg mb-4 flex items-center justify-between">
                 <div className="text-sm">
                     <p className="font-semibold text-white">{project.businessName}</p>
                     <p className="text-emerald-400 text-xs">{project.chapters.length} chapters</p>
                 </div>
                 <button 
                    onClick={() => setView(ViewState.OUTLINE)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2"
                 >
                     {t.onboarding.continueBtn} <ArrowRight size={14} />
                 </button>
             </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">{t.onboarding.businessNameLabel}</label>
          <input 
            type="text" 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder={t.onboarding.businessNamePlace}
            value={project.businessName}
            onChange={e => setProject({...project, businessName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">{t.onboarding.nicheLabel}</label>
          <input 
            type="text" 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder={t.onboarding.nichePlace}
            value={project.niche}
            onChange={e => setProject({...project, niche: e.target.value})}
          />
        </div>
        <button 
          onClick={handleStartProject}
          disabled={!project.businessName || !project.niche || isLoading || (!envApiKey && !manualApiKey)}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
          {isLoading ? t.onboarding.loading : t.onboarding.button}
        </button>
      </div>
    </div>
  );

  const renderOutline = () => (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h2 className="text-3xl font-bold text-white mb-2">{t.outline.title}</h2>
        <p className="text-slate-400">{t.outline.subtitle}</p>
      </div>

      <div className="grid gap-4">
        {project.chapters.map((chapter, idx) => (
          <div key={chapter.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg hover:border-emerald-500/30 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 text-sm font-bold shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">{chapter.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{chapter.description}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                    setCurrentChapterIndex(idx);
                    setView(ViewState.EDITOR);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-emerald-400 hover:text-emerald-300 transition-opacity flex items-center gap-2 text-sm"
              >
                <span>Edit</span>
                <LayoutTemplate size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button 
            onClick={() => {
                setCurrentChapterIndex(0);
                setView(ViewState.EDITOR);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/20"
        >
            {t.outline.startWriting}
            <Send size={18} />
        </button>
      </div>
    </div>
  );

  const renderEditor = () => {
    // Graceful handling if chapters are deleted or index is out of bounds
    const chapter = project.chapters[currentChapterIndex];
    
    if (!chapter) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <p>{t.editor.selectChapter}</p>
            </div>
        );
    }

    return (
      <div className="h-full flex flex-col w-full animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-wide">{t.editor.chapter} {currentChapterIndex + 1}</h2>
            <h1 className="text-2xl font-bold text-white">{chapter.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
               onClick={() => handleGenerateChapter(currentChapterIndex)}
               disabled={chapter.isGenerating}
               className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
              {chapter.isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {chapter.content ? t.editor.regenerate : t.editor.generate}
            </button>
          </div>
        </div>

        {/* Content Area - SPLIT PANE */}
        <div className="flex-1 overflow-hidden relative">
            {chapter.isGenerating ? (
                <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center text-slate-500">
                    <Loader2 size={48} className="animate-spin text-emerald-500 mb-4" />
                    <p className="animate-pulse font-medium text-emerald-400">{t.editor.writing}</p>
                    <p className="text-xs mt-2 text-slate-600">{t.editor.usingModel}</p>
                </div>
            ) : null}

            {chapter.content || chapter.isGenerating ? (
                <div className="flex flex-col lg:flex-row h-full">
                    {/* Left: Editor */}
                    <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/30">
                        <div className="p-3 border-b border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                           <FileText size={14} />
                           {t.editor.markdownInput}
                        </div>
                        <textarea 
                           className="flex-1 w-full bg-transparent p-6 resize-none focus:outline-none font-mono text-sm text-slate-300 leading-relaxed custom-scrollbar"
                           value={chapter.content || ''}
                           onChange={(e) => handleChapterContentChange(e.target.value)}
                           spellCheck={false}
                           placeholder="# Start writing or generate content..."
                        />
                    </div>
                    
                    {/* Right: Preview */}
                    <div className="w-full lg:w-1/2 flex flex-col bg-slate-950/50">
                        <div className="p-3 border-b border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                           <Eye size={14} />
                           {t.editor.preview}
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="prose prose-invert prose-emerald max-w-none">
                                <MarkdownRenderer content={chapter.content || ''} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-800 rounded-xl m-12 text-center bg-slate-900/20">
                    <div className="bg-slate-800 p-4 rounded-full mb-4">
                        <PenTool size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">{t.editor.ready}</h3>
                    <p className="text-slate-400 max-w-md mb-6">
                        {t.editor.aiAnalyze(project.niche, chapter.title)}
                    </p>
                    <button 
                        onClick={() => handleGenerateChapter(currentChapterIndex)}
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2"
                    >
                        {t.editor.startGen} <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
      </div>
    );
  };

  const renderImages = () => (
    <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full animate-fade-in">
       <div className="mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white">{t.images.title}</h2>
                <p className="text-slate-400">{t.images.subtitle}</p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button 
                    onClick={() => setActiveImageTab('generate')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeImageTab === 'generate' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    {t.images.tabGen}
                </button>
                <button 
                    onClick={() => setActiveImageTab('gallery')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeImageTab === 'gallery' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    {t.images.tabGal} ({project.images.length})
                </button>
            </div>
       </div>

       {activeImageTab === 'generate' ? (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
               <div className="lg:col-span-1 space-y-6">
                   <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                       <label className="block text-sm font-medium text-white mb-2">{t.images.promptLabel}</label>
                       <textarea 
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32"
                          placeholder={t.images.promptPlace}
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                       ></textarea>
                       <div className="mt-4 flex gap-2">
                           <button 
                                onClick={handleGetImageSuggestions}
                                disabled={isLoading}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-lg border border-slate-700 transition-colors"
                           >
                               {isLoading ? t.images.thinking : t.images.suggestBtn}
                           </button>
                           <button 
                                onClick={handleGenerateImage}
                                disabled={!imagePrompt || isLoading}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs py-2.5 rounded-lg font-medium transition-colors"
                           >
                               {isLoading ? t.images.generating : t.images.genBtn}
                           </button>
                       </div>
                   </div>

                   {suggestedPrompts.length > 0 && (
                       <div className="space-y-3">
                           <p className="text-xs font-semibold text-slate-500 uppercase">{t.images.suggestedTitle}</p>
                           {suggestedPrompts.map((prompt, i) => (
                               <div 
                                    key={i} 
                                    onClick={() => setImagePrompt(prompt)}
                                    className="bg-slate-900/50 hover:bg-slate-800 p-3 rounded-lg border border-slate-800 cursor-pointer transition-colors text-xs text-slate-300"
                               >
                                   {prompt}
                               </div>
                           ))}
                       </div>
                   )}
               </div>

               <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                   {isLoading && (
                       <div className="absolute inset-0 bg-slate-950/80 z-10 flex flex-col items-center justify-center">
                           <Loader2 size={48} className="animate-spin text-emerald-500" />
                           <p className="text-emerald-400 mt-4 animate-pulse">{t.images.creating}</p>
                       </div>
                   )}
                   {project.images.length > 0 ? (
                        <div className="w-full h-full p-4 flex items-center justify-center">
                             <img src={project.images[0].url} alt="Latest generated" className="max-h-full max-w-full rounded-lg shadow-2xl object-contain" />
                        </div>
                   ) : (
                       <div className="text-center p-12">
                           <ImagePlus size={64} className="mx-auto text-slate-700 mb-4" />
                           <p className="text-slate-500">{t.images.emptyPlaceholder}</p>
                       </div>
                   )}
               </div>
           </div>
       ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
                {project.images.map((img) => (
                    <div key={img.id} className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                        <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <p className="text-xs text-white line-clamp-2 mb-2">{img.prompt}</p>
                            <a 
                                href={img.url} 
                                download={`ebook-asset-${img.id}.png`}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded text-center"
                            >
                                {t.images.download}
                            </a>
                        </div>
                    </div>
                ))}
                {project.images.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">{t.images.noImages}</div>
                )}
           </div>
       )}
    </div>
  );

  const renderExport = () => (
      <div className="max-w-4xl mx-auto p-8 text-center animate-fade-in">
          <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{t.export.title}</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
              {t.export.desc(project.niche, project.chapters.filter(c => c.content).length, project.images.length)}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <button 
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl border border-slate-700 transition-colors flex flex-col items-center gap-2"
              >
                  <RefreshCw size={24} />
                  <span>{t.export.print}</span>
              </button>
              <button 
                 className="bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex flex-col items-center gap-2"
                 onClick={() => {
                     alert(t.export.alert);
                 }}
              >
                  <Download size={24} />
                  <span>{t.export.download}</span>
              </button>
          </div>
      </div>
  );

  if (view === ViewState.ONBOARDING) {
    return renderOnboarding();
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <Sidebar 
        currentView={view} 
        chapters={project.chapters}
        onNavigate={setView}
        onSelectChapter={setCurrentChapterIndex}
        currentChapterIndex={currentChapterIndex}
        language={language}
        onToggleLanguage={toggleLanguage}
        onResetProject={handleResetProject}
      />
      
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {view === ViewState.OUTLINE && renderOutline()}
        {view === ViewState.EDITOR && renderEditor()}
        {view === ViewState.IMAGES && renderImages()}
        {view === ViewState.EXPORT && renderExport()}
      </main>
    </div>
  );
}
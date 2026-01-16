import React from 'react';
import { BookOpen, Image as ImageIcon, Download, Settings, Languages } from 'lucide-react';
import { ViewState, Chapter, Language } from '../types';
import { translations } from '../translations';

interface Props {
  currentView: ViewState;
  chapters: Chapter[];
  onNavigate: (view: ViewState) => void;
  onSelectChapter: (index: number) => void;
  currentChapterIndex: number;
  language: Language;
  onToggleLanguage: () => void;
}

export const Sidebar: React.FC<Props> = ({ 
  currentView, 
  chapters, 
  onNavigate, 
  onSelectChapter,
  currentChapterIndex,
  language,
  onToggleLanguage
}) => {
  const t = translations[language].sidebar;

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 h-screen flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex justify-between items-start mb-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-emerald-600 p-1.5 rounded-lg">
                <BookOpen size={20} className="text-white" />
            </span>
            {t.title}
            </h1>
            <button 
                onClick={onToggleLanguage}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors border border-slate-700"
                title="Switch Language"
            >
                <Languages size={12} />
                <span className="font-semibold uppercase">{language}</span>
            </button>
        </div>
        <p className="text-xs text-slate-400">{t.subtitle}</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.structureSection}</h3>
            <button 
                onClick={() => onNavigate(ViewState.OUTLINE)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === ViewState.OUTLINE ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
                <Settings size={18} />
                {t.outline}
            </button>
        </div>

        <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.chaptersSection}</h3>
            <div className="space-y-1">
                {chapters.map((chapter, index) => (
                    <button
                        key={chapter.id}
                        onClick={() => {
                            onNavigate(ViewState.EDITOR);
                            onSelectChapter(index);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left group ${
                            currentView === ViewState.EDITOR && currentChapterIndex === index
                                ? 'bg-slate-800 text-white border-l-2 border-emerald-500' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-2 truncate">
                           <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                               chapter.content ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-700 text-slate-400'
                           }`}>
                               {index + 1}
                           </span>
                           <span className="truncate">{chapter.title}</span>
                        </div>
                        {chapter.content && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                    </button>
                ))}
                {chapters.length === 0 && (
                    <div className="px-3 py-4 text-sm text-slate-500 italic text-center border border-dashed border-slate-800 rounded-md whitespace-pre-line">
                        {t.noChapters}
                    </div>
                )}
            </div>
        </div>

        <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.assetsSection}</h3>
            <button 
                onClick={() => onNavigate(ViewState.IMAGES)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === ViewState.IMAGES ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
                <ImageIcon size={18} />
                {t.visuals}
            </button>
            <button 
                onClick={() => onNavigate(ViewState.EXPORT)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === ViewState.EXPORT ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
                <Download size={18} />
                {t.export}
            </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
         <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{t.systemOnline}</span>
         </div>
      </div>
    </div>
  );
};

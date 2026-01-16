import React from 'react';

interface Props {
  content: string;
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  // Simple regex-based parser for basic markdown to avoid heavy dependencies
  // In a real production app, use react-markdown
  
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 text-slate-300 leading-relaxed">
      {lines.map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold text-emerald-400 mt-6 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4 border-b border-slate-700 pb-2">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-extrabold text-white mb-6">{line.replace('# ', '')}</h1>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 list-disc marker:text-emerald-500">{line.replace('- ', '')}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
           return <p key={index} className="font-bold text-white">{line.replace(/\*\*/g, '')}</p>
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index}>{line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('<strong>').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-emerald-200 font-semibold">{part}</strong> : part)}</p>;
      })}
    </div>
  );
};

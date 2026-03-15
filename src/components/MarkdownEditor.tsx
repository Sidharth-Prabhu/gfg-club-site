import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCode, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Write in Markdown...', 
  label,
  minHeight = '300px'
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-end mb-1 px-2">
          <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em]">
            {label}
          </label>
          <div className="flex bg-background border border-border p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all flex items-center gap-1.5 ${
                mode === 'edit' ? 'bg-accent text-white shadow-lg' : 'text-text/40 hover:text-text'
              }`}
            >
              <FontAwesomeIcon icon={faCode} /> Edit
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all flex items-center gap-1.5 ${
                mode === 'preview' ? 'bg-accent text-white shadow-lg' : 'text-text/40 hover:text-text'
              }`}
            >
              <FontAwesomeIcon icon={faEye} /> Preview
            </button>
          </div>
        </div>
      )}

      <div 
        className="bg-background rounded-2xl border-2 border-border focus-within:border-accent transition-all overflow-hidden shadow-inner flex flex-col"
        style={{ minHeight }}
      >
        {mode === 'edit' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-6 bg-transparent outline-none text-text font-medium italic resize-y min-h-[300px]"
          />
        ) : (
          <div className="p-6 h-full overflow-y-auto bg-card/20">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text/20 py-20 space-y-2">
                <FontAwesomeIcon icon={faInfoCircle} size="2x" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Nothing to preview</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {mode === 'edit' && (
        <p className="px-2 text-[7px] font-bold text-text/30 uppercase tracking-[0.15em] flex items-center gap-1.5 italic">
          <FontAwesomeIcon icon={faInfoCircle} className="text-accent" /> Markdown is supported. Use **bold**, *italic*, # Headers, etc.
        </p>
      )}
    </div>
  );
};

export default MarkdownEditor;

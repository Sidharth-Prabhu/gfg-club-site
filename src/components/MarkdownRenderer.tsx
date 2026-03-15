import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
      
      <style>{`
        .markdown-content {
          line-height: 1.7;
          font-weight: 500;
        }
        .markdown-content h1, 
        .markdown-content h2, 
        .markdown-content h3, 
        .markdown-content h4 {
          color: var(--color-text);
          font-weight: 900;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          text-transform: uppercase;
          font-style: italic;
          letter-spacing: -0.02em;
        }
        .markdown-content h1 { font-size: 2.25rem; border-bottom: 2px solid var(--color-border); pb-2; }
        .markdown-content h2 { font-size: 1.875rem; }
        .markdown-content h3 { font-size: 1.5rem; }
        
        .markdown-content p {
          margin-bottom: 1.25em;
        }
        
        .markdown-content ul, 
        .markdown-content ol {
          margin-bottom: 1.25em;
          padding-left: 1.5em;
        }
        
        .markdown-content ul { list-style-type: disc; }
        .markdown-content ol { list-style-type: decimal; }
        
        .markdown-content li {
          margin-bottom: 0.5em;
        }
        
        .markdown-content a {
          color: var(--color-accent);
          font-weight: 800;
          text-decoration: underline;
          transition: opacity 0.2s;
        }
        .markdown-content a:hover {
          opacity: 0.8;
        }
        
        .markdown-content blockquote {
          border-left: 4px solid var(--color-accent);
          padding-left: 1.5em;
          font-style: italic;
          color: var(--color-text);
          opacity: 0.7;
          margin: 1.5em 0;
        }
        
        .markdown-content code {
          background-color: var(--color-background);
          color: var(--color-accent);
          padding: 0.2em 0.4em;
          border-radius: 0.4em;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
          border: 1px solid var(--color-border);
        }
        
        .markdown-content pre {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          padding: 1.5em;
          border-radius: 1.5rem;
          overflow-x: auto;
          margin: 1.5em 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
          border: none;
          color: inherit;
          font-size: 0.85em;
        }
        
        .markdown-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1.5rem;
          margin: 2em auto;
          display: block;
          border: 2px solid var(--color-border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5em;
          border: 1px solid var(--color-border);
          border-radius: 1rem;
          overflow: hidden;
        }
        
        .markdown-content th, 
        .markdown-content td {
          padding: 0.75em 1em;
          border: 1px solid var(--color-border);
          text-align: left;
        }
        
        .markdown-content th {
          background-color: var(--color-background);
          font-weight: 900;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }
        
        .markdown-content hr {
          border: none;
          border-top: 2px solid var(--color-border);
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
};

export default MarkdownRenderer;

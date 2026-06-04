import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onHeadingsParsed?: (headings: { id: string; text: string; level: number }[]) => void;
}

export function MarkdownRenderer({ content, onHeadingsParsed }: MarkdownRendererProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Collect all headings for the Table of Contents (TOC)
    const lines = content.split('\n');
    const headings: { id: string; text: string; level: number }[] = [];
    
    // Simple state to track inside code blocks to avoid parsing headings inside code
    let inCodeBlock = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;

      const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[*_`#]/g, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        headings.push({ id, text, level });
      }
    });

    if (onHeadingsParsed) {
      onHeadingsParsed(headings);
    }
  }, [content, onHeadingsParsed]);

  const handleCopy = (codeText: string, blockId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(blockId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Basic but durable lines chunker
  const renderMarkdown = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Code Block
      if (trimmed.startsWith('```')) {
        const lang = trimmed.substring(3).trim() || 'code';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        const codeText = codeLines.join('\n');
        const blockId = `code-block-${i}`;
        
        elements.push(
          <div key={blockId} className="my-6 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 dark:bg-black font-mono text-sm leading-relaxed relative">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs select-none">
              <span className="capitalize">{lang}</span>
              <button
                onClick={() => handleCopy(codeText, blockId)}
                className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
                title="复制代码"
              >
                {copiedId === blockId ? (
                  <>
                    <Check size={13} className="text-emerald-400 animate-scale" />
                    <span className="text-emerald-400 font-sans">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="font-sans">复制</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-zinc-100 max-w-full">
              {/* Highlight basic syntax keywords manually for excellent developer-level feel */}
              <code>
                {highlightCode(codeText, lang)}
              </code>
            </pre>
          </div>
        );
        i++;
        continue;
      }

      // 2. Blockquote
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
          i++;
        }
        elements.push(
          <blockquote key={`quote-${i}`} className="my-5 pl-4 border-l-4 border-emerald-500 italic text-zinc-600 dark:text-zinc-400 bg-emerald-500/5 py-2 px-3 rounded-r">
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className="my-1">{renderInlineStyles(ql)}</p>
            ))}
          </blockquote>
        );
        continue;
      }

      // 3. Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        elements.push(<hr key={`hr-${i}`} className="my-8 border-t border-zinc-200 dark:border-zinc-800" />);
        i++;
        continue;
      }

      // 4. Headings
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].replace(/[*_`#]/g, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        
        const className = 
          level === 1 ? "text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-10 mb-4 h-scroll-anchor border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center group" :
          level === 2 ? "text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4 h-scroll-anchor flex items-center group" :
          level === 3 ? "text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-3 h-scroll-anchor flex items-center group" :
                        "text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-5 mb-2 h-scroll-anchor flex items-center group";

        elements.push(
          React.createElement(`h${level}`, {
            key: `h-${i}`,
            id,
            className,
          }, [
            <a key="link" href={`#${id}`} className="absolute -ml-6 opacity-0 group-hover:opacity-100 text-emerald-500 dark:text-emerald-400 pr-2 transition-opacity font-mono text-sm inline-block select-none" style={{ scrollMarginTop: '80px' }}>#</a>,
            renderInlineStyles(headingMatch[2])
          ])
        );
        i++;
        continue;
      }

      // 5. Lists (Unordered and Ordered)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
        const isOrdered = /^\d+\.\s+/.test(trimmed);
        const listItems: string[] = [];
        
        if (isOrdered) {
          while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
            listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
            i++;
          }
          elements.push(
            <ol key={`ol-${i}`} className="my-5 pl-6 list-decimal space-y-2 text-zinc-800 dark:text-zinc-300">
              {listItems.map((item, idx) => (
                <li key={idx} className="pl-1 leading-relaxed">
                  {renderInlineStyles(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
            listItems.push(lines[i].trim().substring(2));
            i++;
          }
          elements.push(
            <ul key={`ul-${i}`} className="my-5 pl-6 list-disc space-y-2 text-zinc-800 dark:text-zinc-300">
              {listItems.map((item, idx) => (
                <li key={idx} className="pl-1 leading-relaxed decoration-emerald-500">
                  {renderInlineStyles(item)}
                </li>
              ))}
            </ul>
          );
        }
        continue;
      }

      // 6. Tables
      if (trimmed.startsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        
        if (tableLines.length >= 2) {
          const headers = tableLines[0].split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          const rows = tableLines.slice(2).map(rowStr => 
            rowStr.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          );
          
          elements.push(
            <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                <thead className="bg-emerald-500/5 dark:bg-emerald-500/10">
                  <tr>
                    {headers.map((th, thIdx) => (
                      <th key={thIdx} className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                        {renderInlineStyles(th)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 bg-white dark:bg-zinc-950">
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                          {renderInlineStyles(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 7. Standard Paragraph / Empty Line
      if (trimmed === '') {
        i++;
        continue;
      }

      // Check for image block: ![alt](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        elements.push(
          <div key={`img-${i}`} className="my-6 flex flex-col items-center justify-center">
            <img 
              src={imgMatch[2]} 
              alt={imgMatch[1]} 
              className="rounded-lg shadow-md max-w-full max-h-[450px] object-cover border border-zinc-100 dark:border-zinc-800"
              referrerPolicy="no-referrer"
            />
            {imgMatch[1] && (
              <span className="text-xs text-zinc-500 mt-2 italic">{imgMatch[1]}</span>
            )}
          </div>
        );
        i++;
        continue;
      }

      // Standard text line
      elements.push(
        <p key={`p-${i}`} className="my-4 leading-relaxed text-zinc-800 dark:text-zinc-300">
          {renderInlineStyles(trimmed)}
        </p>
      );
      i++;
    }

    return elements;
  };

  // Safe syntax highlight using simple sub-string regex parsing inside JSX code blocks
  const highlightCode = (code: string, lang: string) => {
    if (!code) return '';
    
    // Simple color maps
    // Keywords, Types, Strings, Comments, Numbers
    const tokens: React.ReactNode[] = [];
    const lines = code.split('\n');

    return lines.map((line, lineIdx) => {
      // Find comment and split
      const commentIdx = line.indexOf('//');
      let codePart = commentIdx !== -1 ? line.substring(0, commentIdx) : line;
      const commentPart = commentIdx !== -1 ? line.substring(commentIdx) : '';

      // Elements of this line
      const lineElements: React.ReactNode[] = [];

      // Tokenize the codePart
      const regex = /(\bconst\b|\blet\b|\bvar\b|\bfunction\b|\bimport\b|\bfrom\b|\breturn\b|\bif\b|\belse\b|\benum\b|\binterface\b|\btype\b|\bclass\b|\bextends\b|\basync\b|\bawait\b|\btry\b|\bcatch\b|\bfinally\b|'[^']*'|"[^"]*"|`[^`]*`|\d+)/g;
      const parts = codePart.split(regex);

      parts.forEach((part, partIdx) => {
        if (!part) return;

        if (/^(const|let|var|function|import|from|return|if|else|enum|interface|type|class|extends|async|await|try|catch|finally)$/.test(part)) {
          lineElements.push(<span key={partIdx} className="text-emerald-400 font-bold">{part}</span>);
        } else if (/^('[^']*'|"[^"]*"|`[^`]*`)$/.test(part)) {
          lineElements.push(<span key={partIdx} className="text-lime-300">{part}</span>);
        } else if (/^\d+$/.test(part)) {
          lineElements.push(<span key={partIdx} className="text-amber-300">{part}</span>);
        } else {
          // Regular content, highlight types or other words optionally
          lineElements.push(<span key={partIdx}>{part}</span>);
        }
      });

      if (commentPart) {
        lineElements.push(<span key="comment" className="text-zinc-500 italic">{commentPart}</span>);
      }

      return (
        <div key={lineIdx} className="min-h-[1.25rem]">
          <span className="inline-block w-6 text-zinc-600 select-none text-right pr-2 text-xs select-none border-r border-zinc-800 mr-3">{lineIdx + 1}</span>
          {lineElements}
        </div>
      );
    });
  };

  // Renders bold, italic, code, and links in inline styles
  const renderInlineStyles = (text: string): React.ReactNode[] => {
    // Basic regex splitting
    // Match inline code: `code`, absolute bold: **bold**, link: [label](href)
    const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-zinc-900 dark:text-zinc-100">{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
         return (
           <a 
             key={index} 
             href={linkMatch[2]} 
             target={linkMatch[2].startsWith('http') ? '_blank' : '_self'}
             rel="noopener noreferrer"
             className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-4 decoration-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
           >
             {linkMatch[1]}
           </a>
         );
      }
      return part;
    });
  };

  return (
    <div className="prose prose-emerald max-w-none dark:prose-invert">
      {renderMarkdown()}
    </div>
  );
}

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag key={key++} className={`my-2 ml-4 space-y-1 ${listType === 'ul' ? 'list-disc' : 'list-decimal'}`}>
            {listItems.map((item, i) => (
              <li key={i} className="text-sm">
                {renderInline(item)}
              </li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    const renderInline = (text: string): React.ReactNode => {
      // Handle bold text with ** or __
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let inlineKey = 0;

      while (remaining.length > 0) {
        // Check for bold **text**
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(remaining.slice(0, boldMatch.index));
          }
          parts.push(
            <strong key={inlineKey++} className="font-semibold text-foreground">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
          continue;
        }

        // Check for italic *text*
        const italicMatch = remaining.match(/\*(.+?)\*/);
        if (italicMatch && italicMatch.index !== undefined) {
          if (italicMatch.index > 0) {
            parts.push(remaining.slice(0, italicMatch.index));
          }
          parts.push(
            <em key={inlineKey++} className="italic">
              {italicMatch[1]}
            </em>
          );
          remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
          continue;
        }

        // Check for inline code `text`
        const codeMatch = remaining.match(/`(.+?)`/);
        if (codeMatch && codeMatch.index !== undefined) {
          if (codeMatch.index > 0) {
            parts.push(remaining.slice(0, codeMatch.index));
          }
          parts.push(
            <code key={inlineKey++} className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              {codeMatch[1]}
            </code>
          );
          remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
          continue;
        }

        // No more matches, add remaining text
        parts.push(remaining);
        break;
      }

      return parts.length === 1 ? parts[0] : <>{parts}</>;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Empty line
      if (line === '') {
        flushList();
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={key++} className="font-bold text-base mt-4 mb-2 text-foreground">
            {renderInline(line.slice(4))}
          </h3>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={key++} className="font-bold text-lg mt-4 mb-2 text-foreground">
            {renderInline(line.slice(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={key++} className="font-bold text-xl mt-4 mb-2 text-foreground">
            {renderInline(line.slice(2))}
          </h1>
        );
        continue;
      }

      // Unordered list items (-, *, •)
      const ulMatch = line.match(/^[-*•]\s+(.+)/);
      if (ulMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(ulMatch[1]);
        continue;
      }

      // Ordered list items (1., 2., etc.)
      const olMatch = line.match(/^\d+\.\s+(.+)/);
      if (olMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(olMatch[1]);
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={key++} className="text-sm mb-2 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }

    flushList();
    return elements;
  };

  return (
    <div className={`markdown-content ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};

import React from "react";

// Helper to detect subheadlines in lessons (short lines ending with ":" or all-caps patterns)
export const isSubheadline = (paragraph: string): boolean => {
  const trimmed = paragraph.trim();
  if (trimmed.length < 80 && trimmed.endsWith(':')) return true;
  if (trimmed.startsWith('STEP ')) return true;
  if (trimmed.startsWith('PART ')) return true;
  if (trimmed.startsWith('THE ') && trimmed.length < 50) return true;
  if (trimmed.startsWith('BUILD →')) return true;
  if (trimmed === 'The WINNING FORMULA') return true;
  const upperRatio = (trimmed.match(/[A-Z]/g) || []).length / trimmed.length;
  if (trimmed.length < 60 && upperRatio > 0.6) return true;
  return false;
};

// Helper to parse links inside text (used for bold content)
export const parseLinksOnly = (text: string, keyPrefix: string): React.ReactNode => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const isExternal = match[2].startsWith('http');
    parts.push(
      React.createElement('a', {
        key: `${keyPrefix}-${match.index}`,
        href: match[2],
        target: isExternal ? "_blank" : undefined,
        rel: isExternal ? "noopener noreferrer" : undefined,
        className: "text-primary hover:underline",
      }, match[1])
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

// Helper to parse markdown-style links [text](url) and bold ***text*** and render as React elements
export const parseLinks = (text: string): React.ReactNode => {
  const combinedRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*\*([^*]+)\*\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      const isExternal = match[2].startsWith('http');
      parts.push(
        React.createElement('a', {
          key: match.index,
          href: match[2],
          target: isExternal ? "_blank" : undefined,
          rel: isExternal ? "noopener noreferrer" : undefined,
          className: "text-primary hover:underline font-medium",
        }, match[1])
      );
    } else if (match[3]) {
      parts.push(
        React.createElement('span', {
          key: match.index,
          className: "font-bold text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded",
        }, parseLinksOnly(match[3], `bold-${match.index}`))
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

import React from 'react';
import '../searchMenuModal.css';

interface Props {
  text: string;
  keyword: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 高亮文本组件
 * @param text 文本
 * @param keyword 关键词
 * @returns 高亮文本组件
 */
const HighlightText: React.FC<Props> = ({ text, keyword }) => {
  if (!keyword) return <span>{text}</span>;

  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  const parts = text.split(regex);
  const nodes: React.ReactNode[] = [];
  let offset = 0;

  for (let partIndex = 0; partIndex < parts.length; partIndex++) {
    const part = parts[partIndex];
    if (!part) continue;

    const isHighlight = partIndex % 2 === 1;
    const key = `${isHighlight ? 'h' : 't'}-${offset}-${part.length}`;

    if (isHighlight) {
      nodes.push(
        <mark key={key} className="highlightText">
          {part}
        </mark>
      );
    } else {
      nodes.push(<span key={key}>{part}</span>);
    }

    offset += part.length;
  }

  return <span>{nodes}</span>;
};

export default HighlightText;

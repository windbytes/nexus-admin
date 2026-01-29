import React from 'react';
import '../searchMenuModal.scss';

interface Props {
  text: string;
  keyword: string;
}

/**
 * 高亮文本组件
 * @param text 文本
 * @param keyword 关键词
 * @returns 高亮文本组件
 */
const HighlightText: React.FC<Props> = ({ text, keyword }) => {
  if (!keyword) return <span>{text}</span>;
  const regex = new RegExp(`(${keyword})`, 'gi');
  const parts = text.split(regex);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (regex.test(part)) {
      nodes.push(
        <mark key={`h-${text}-${part}-${i}`} className="highlightText">
          {part}
        </mark>,
      );
    } else {
      nodes.push(<span key={`t-${text}-${part}-${i}`}>{part}</span>);
    }
  }
  return <span>{nodes}</span>;
};

export default React.memo(HighlightText);

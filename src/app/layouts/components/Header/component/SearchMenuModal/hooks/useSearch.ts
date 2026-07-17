import type { RouteItem } from '@/types/route';
import type { Menus, SearchResultItem } from '../types';

// 计算搜索匹配度分数
function calculateSearchScore(text: string, keyword: string): number {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  if (!lowerKeyword) return 0;
  if (lowerText === lowerKeyword) return 100;
  if (lowerText.startsWith(lowerKeyword)) return 90;
  if (lowerText.includes(lowerKeyword)) return 70;
  let score = 0;
  let keywordIndex = 0;
  for (let i = 0; i < lowerText.length && keywordIndex < lowerKeyword.length; i++) {
    if (lowerText[i] === lowerKeyword[keywordIndex]) {
      score += 10;
      keywordIndex++;
    }
  }
  return score;
}

function collectResults(menuList: RouteItem[], keyword: string): SearchResultItem[] {
  const results: SearchResultItem[] = [];
  const traverse = (menus: RouteItem[], parentPath = '') => {
    menus.forEach((menu) => {
      if (menu.name && menu.route) {
        const nameScore = calculateSearchScore(menu.name, keyword);
        const pathScore = menu.path ? calculateSearchScore(menu.path, keyword) : 0;
        const maxScore = Math.max(nameScore, pathScore);
        if (maxScore > 0) {
          results.push({
            id: menu.id,
            name: menu.name,
            path: menu.path,
            icon: menu.meta?.icon,
            parentPath,
            keyword,
            score: maxScore,
          });
        }
      }
      if (menu.children && menu.children.length > 0) {
        const currentPath = parentPath ? `${parentPath} > ${menu.name}` : menu.name;
        traverse(menu.children, currentPath);
      }
    });
  };
  traverse(menuList);
  return results.sort((a, b) => (b.score || 0) - (a.score || 0));
}

export function useSearch(menus: Menus, keyword: string): SearchResultItem[] {
  const value = keyword.trim();
  if (!value) return [];
  return collectResults(menus, value);
}

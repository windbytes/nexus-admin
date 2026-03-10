/**
 * 工具栏插件贡献：合并 base 配置与插件贡献，得到最终分组列表
 */

import type { TabItemConfig, ToolbarContribution, ToolGroupConfig } from '../../types';

/** 按 tabKey 存储的插件贡献列表（同一 tab 可有多个插件贡献） */
const contributionsByTab = new Map<string, ToolbarContribution[]>();

/**
 * 注册某 Tab 的工具栏贡献（插件 install 时调用）
 */
export function registerToolbarContribution(tabKey: string, contribution: ToolbarContribution): void {
  const list = contributionsByTab.get(tabKey) ?? [];
  list.push(contribution);
  contributionsByTab.set(tabKey, list);
}

/**
 * 注销某 Tab 的工具栏贡献（插件 uninstall 时调用，会清除该 tab 下所有插件贡献）
 */
export function unregisterToolbarContribution(tabKey: string): void {
  contributionsByTab.delete(tabKey);
}

/**
 * 合并 base 配置与插件贡献，得到当前 Tab 的完整分组列表
 * 顺序：先 base 的 groups，再各插件贡献的 groups
 */
export function getMergedToolbarConfig(tabKey: string, baseTab: TabItemConfig | undefined): ToolGroupConfig[] {
  const baseGroups = baseTab?.groups ?? [];
  const contribList = contributionsByTab.get(tabKey) ?? [];
  const contribGroups = contribList.flatMap((c) => c.groups);
  return [...baseGroups, ...contribGroups];
}

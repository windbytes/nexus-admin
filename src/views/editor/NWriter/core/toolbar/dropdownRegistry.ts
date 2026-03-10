/**
 * 下拉内容注册表：插件通过 toolKey 注册自定义 dropdown 内容，配置中通过 getDropdownContent(toolKey) 取用
 */

import type { ReactNode } from 'react';

type DropdownRender = () => ReactNode;

const registry = new Map<string, DropdownRender>();

export function registerDropdownContent(toolKey: string, render: DropdownRender): void {
  registry.set(toolKey, render);
}

export function unregisterDropdownContent(toolKey: string): boolean {
  return registry.delete(toolKey);
}

export function getDropdownContent(toolKey: string): DropdownRender | undefined {
  return registry.get(toolKey);
}

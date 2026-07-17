import { type ComponentType, lazy } from 'react';
import { PlaceholderPage } from './fallback';

/**
 * 菜单 component 字段 → 业务页面组件 的映射。
 *
 * 后端菜单返回的 `component` 是相对 modules 的逻辑路径（如 `system/user`、`dashboard`）。
 * 这里通过 Vite 的 import.meta.glob 在构建期收集 modules 下所有页面，
 * 运行期按约定路径解析，解析不到时回退到占位页。
 */
const pageModules = import.meta.glob(['/src/modules/**/*.tsx', '!/src/modules/auth/**']);

type PageLoader = () => Promise<{ default?: ComponentType<unknown> }>;

/**
 * 按约定路径在 modules 中匹配页面模块加载器。
 *
 * 依次尝试：
 *  - `/src/modules/{domain}/pages/{feature}/index.tsx`（如 `system/menu` → `system/pages/menu`）
 *  - `/src/modules/{component}/pages/index.tsx`（如 `dashboard` → `dashboard/pages`）
 *  - `/src/modules/{component}/index.tsx`
 *  - `/src/modules/{component}.tsx`
 *
 * @param component - 后端菜单 `component` 字段，例如 `system/menu`、`dashboard`
 * @returns 动态 import 加载器；未命中任何候选路径时返回 `undefined`
 */
function matchPageLoader(component: string): PageLoader | undefined {
  const normalized = component.replace(/^\/+/, '').replace(/\.tsx$/, '');
  const candidates: string[] = [];

  if (normalized.includes('/')) {
    const [domain, ...rest] = normalized.split('/');
    const feature = rest.join('/');
    candidates.push(`/src/modules/${domain}/pages/${feature}/index.tsx`);
  }

  candidates.push(
    `/src/modules/${normalized}/pages/index.tsx`,
    `/src/modules/${normalized}/index.tsx`,
    `/src/modules/${normalized}.tsx`
  );

  for (const candidate of candidates) {
    if (pageModules[candidate]) {
      return pageModules[candidate] as PageLoader;
    }
  }

  return undefined;
}

/**
 * 将菜单 `component` 字段解析为可懒加载的页面组件。
 *
 * - 命中且模块存在 `default` 导出 → 使用真实页面组件
 * - 命中但模块尚未实现（无 default，例如 `export {}` 占位）→ 回退占位页
 * - 未命中 → 回退占位页
 *
 * @param component - 后端菜单组件路径，例如 `system/menu`
 * @returns React.lazy 包装后的页面组件
 */
export function resolvePageComponent(component: string) {
  const loader = matchPageLoader(component);

  return lazy(async () => {
    if (!loader) {
      return { default: PlaceholderPage };
    }
    const mod = await loader();
    return { default: mod.default ?? PlaceholderPage };
  });
}

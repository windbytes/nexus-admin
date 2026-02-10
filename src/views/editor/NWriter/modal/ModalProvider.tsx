import { useEffect, useState } from 'react';
import { bindModalRuntime } from './modalManager';
import { getModal } from './registry';
import type { ModalInstance } from './types';

/**
 * 弹窗提供者
 * @param children 子组件
 * @returns 子组件
 */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<ModalInstance[]>([]);

  /**
   * 绑定弹窗运行时
   */
  useEffect(() => {
    bindModalRuntime(
      (modal) => setStack((s) => [...s, modal]),
      (id) => setStack((s) => s.filter((m) => m.id !== id))
    );
  }, []);

  /**
   * 渲染子组件
   */
  return (
    <>
      {children}
      {stack.map((m) => {
        const Comp = getModal(m.type);
        if (!Comp) {
          return null;
        }

        return <Comp key={m.id} {...m.props} onResolve={m.resolve} onReject={m.reject} />;
      })}
    </>
  );
}

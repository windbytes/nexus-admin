import { useEffect, useRef, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import { bindModalRuntime } from './modalManager';
import { getModal } from './registry';
import type { ModalInstance } from './types';

/** 基础 z-index，每层递增，避免与 Ant Design 默认 1000 冲突 */
const MODAL_Z_INDEX_BASE = 1100;

/**
 * 弹窗提供者
 * 1. 在挂载时绑定弹窗运行时（push/pop/getStack）供 openModal/closeModal 使用
 * 2. 根据栈内实例按类型从 registry 取组件并渲染，支持多弹窗叠放与选项透传
 */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<ModalInstance[]>([]);
  const stackRef = useRef<ModalInstance[]>([]);
  stackRef.current = stack;

  useEffect(() => {
    bindModalRuntime(
      (modal) => setStack((s) => [...s, modal]),
      (id) => setStack((s) => s.filter((m) => m.id !== id)),
      () => stackRef.current
    );
  }, []);

  return (
    <>
      {children}
      {stack.map((m, index) => {
        const Comp = getModal(m.type);
        if (!Comp) {
          console.warn(`[NWriter.Modal] 未注册的弹窗类型: ${m.type}`);
          return null;
        }
        const zIndex = m.options.zIndex ?? MODAL_Z_INDEX_BASE + index;
        return (
          <DragModal
            key={m.id}
            open
            destroyOnHidden={m.options.destroyOnHidden ?? true}
            keyboard={m.options.keyboard ?? true}
            width={m.options.width}
            wrapClassName={m.options.wrapClassName}
            style={{ zIndex }}
            styles={{
              mask: m.options.maskStyle,
            }}
            footer={null}
            closable={false}
            onCancel={() => m.reject()}
            mask={{
              closable: m.options.maskClosable ?? true,
            }}
          >
            <Comp modalId={m.id} {...m.props} onResolve={m.resolve} onReject={m.reject} />
          </DragModal>
        );
      })}
    </>
  );
}

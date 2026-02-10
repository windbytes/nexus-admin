import { nanoid } from 'nanoid';
import type { ModalInstance } from './types';

let pushFn: (modal: ModalInstance) => void;
let popFn: (id: string) => void;

/**
 * 绑定弹窗运行时
 * @param push 添加弹窗
 * @param pop 移除弹窗
 */
export function bindModalRuntime(push: typeof pushFn, pop: typeof popFn) {
  pushFn = push;
  popFn = pop;
}

/**
 * 打开弹窗
 * @param type 弹窗类型
 * @param props 弹窗属性
 * @returns 弹窗结果
 */
export function openModal<T = any>(type: string, props?: any): Promise<T> {
  if (!pushFn) {
    throw new Error('Modal runtime not bound');
  }

  return new Promise<T>((resolve, reject) => {
    const id = nanoid();

    pushFn({
      id,
      type,
      props,
      resolve: (value) => {
        resolve(value);
        popFn(id);
      },
      reject: () => {
        reject();
        popFn(id);
      },
    });
  });
}

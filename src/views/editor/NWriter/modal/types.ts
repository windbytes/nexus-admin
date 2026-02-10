import type { ComponentType } from 'react';

/**
 * 弹窗结果
 */
export type ModalResult = any;

/**
 * 弹窗基础属性
 */
export interface ModalPropsBase {
  onResolve: (result?: ModalResult) => void;
  onReject: () => void;
}

export type ModalComponent<P = any> = ComponentType<P & ModalPropsBase>;

/**
 * 弹窗实例
 */
export interface ModalInstance {
  id: string;
  type: string;
  props: any;
  resolve: (value?: any) => void;
  reject: () => void;
}

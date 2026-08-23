/**
 * 弹窗模块类型定义
 * 用于统一弹窗的注册、打开、关闭及选项配置，便于企业级扩展与复用
 */

import type { ComponentType } from 'react';

/** 弹窗关闭时的结果（由业务自定义，如表单数据、确认取消等） */
export type ModalResult = unknown;

/** 弹窗基础属性：由 ModalProvider 注入，所有弹窗组件必须接收 */
export interface ModalPropsBase {
  /** 弹窗实例 ID，用于程序化关闭 */
  modalId: string;
  /** 确认/完成并关闭，可携带结果 */
  onResolve: (result?: ModalResult) => void;
  /** 取消/关闭且不携带结果 */
  onReject: () => void;
}

/** 弹窗组件类型：业务自定义 Props 与 ModalPropsBase 的交集 */
export type ModalComponent<P = Record<string, unknown>> = ComponentType<P & ModalPropsBase>;

/** 打开弹窗时的可选配置（Ant Design Modal 常用能力可在此扩展） */
export interface ModalOptions {
  /** 点击蒙层是否关闭，默认 true */
  maskClosable?: boolean;
  /** 关闭后是否销毁子元素，默认 true，设为 false 可保留状态 */
  destroyOnHidden?: boolean;
  /** 蒙层样式 */
  maskStyle?: React.CSSProperties;
  /** 弹窗容器类名 */
  wrapClassName?: string;
  /** 宽度 */
  width?: number | string;
  /** 是否支持 ESC 关闭，默认 true */
  keyboard?: boolean;
  /** 自定义 z-index（多弹窗叠放时使用） */
  zIndex?: number;
}

/** 运行时弹窗实例（内部使用，由 modalManager 与 ModalProvider 协作） */
export interface ModalInstance {
  id: string;
  type: string;
  props: Record<string, unknown>;
  options: ModalOptions;
  resolve: (value?: ModalResult) => void;
  reject: () => void;
}

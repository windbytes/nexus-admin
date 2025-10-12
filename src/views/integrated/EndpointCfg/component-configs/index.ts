// 组件配置模块导出
export { default as InputConfig } from './InputConfig';
export { default as InputNumberConfig } from './InputNumberConfig';
export { default as SelectConfig } from './SelectConfig';
export { default as DatePickerConfig } from './DatePickerConfig';
export { default as TextAreaConfig } from './TextAreaConfig';
export { default as RadioConfig } from './RadioConfig';
export { default as SwitchConfig } from './SwitchConfig';

// 组件配置类型定义
export interface ComponentConfigProps {
  /** 当前配置值 */
  value?: any;
  /** 配置变更回调 */
  onChange: (value: any) => void;
  /** 组件类型 */
  componentType: string;
}

// 组件配置基础接口
export interface ComponentProperties {
  [key: string]: any;
}

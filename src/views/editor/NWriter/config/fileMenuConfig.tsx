/**
 * 左侧「文件」下拉菜单及快捷按钮配置
 * 支持分组、二级菜单，均通过配置驱动
 */
import { PrinterOutlined, RedoOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import type { FileMenuConfigItem, LeftQuickActionConfig } from '../types';

/** 文件下拉菜单配置（分组用 divider 隔开） */
export const fileMenuConfig: FileMenuConfigItem[] = [
  {
    key: 'new',
    label: '新建',
    children: [
      { key: 'new-doc', label: '新建' },
      { key: 'new-from-tpl', label: '从模板新建' },
    ],
  },
  { key: 'open', label: '打开' },
  { key: 'save', label: '保存' },
  {
    key: 'saveAs',
    label: '另存为',
    children: [
      { key: 'saveAs-doc', label: '另存为文档' },
      { key: 'saveAs-tpl', label: '另存为模板' },
    ],
  },
  { type: 'divider' },
  { key: 'exportPdf', label: '输出为PDF' },
  { key: 'exportOfd', label: '输出为OFD' },
  { key: 'importExportTpl', label: '导入导出模板' },
  { type: 'divider' },
  { key: 'print', label: '打印' },
  { key: 'printPreview', label: '打印预览' },
  { type: 'divider' },
  { key: 'tplProps', label: '模板属性' },
  { key: 'backupRestore', label: '备份与恢复' },
  { key: 'history', label: '历史记录' },
];

/** 左侧快捷图标按钮配置（保存、输出PDF、打印、打印预览、撤销、重做） */
export const leftQuickActionsConfig: LeftQuickActionConfig[] = [
  { key: 'save', label: '保存', icon: <SaveOutlined /> },
  { key: 'exportPdf', label: '输出PDF', icon: <span className="text-sm font-medium">PDF</span> },
  { key: 'print', label: '打印', icon: <PrinterOutlined /> },
  { key: 'printPreview', label: '打印预览', icon: <PrinterOutlined /> },
  { key: 'undo', label: '撤销', icon: <UndoOutlined /> },
  { key: 'redo', label: '重做', icon: <RedoOutlined /> },
];

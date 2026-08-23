/**
 * Tab 工具栏配置（分组 + 多控件类型，类似 WPS）
 * 字体/字号用 Select，带箭头的用 Dropdown（dropdownRender 占位或插件/具体功能实现）
 */
import React from 'react';
import FontColorDropdownContent from '../components/TabToolbar/dropdowns/FontColorDropdownContent';
import { getDropdownContent } from '../core/toolbar';
import type { TabItemConfig, ToolGroupConfig } from '../types';

/** 下拉占位内容（未由插件或具体功能实现时使用） */
function dropdownPlaceholder(label: string) {
  return () => React.createElement('div', { className: 'py-2 px-3 text-sm text-gray-500' }, `${label} - 下拉占位`);
}

/** 插件实现的 Dropdown：从注册表按 toolKey 取内容，无则回退占位 */
function dropdownFromPlugin(toolKey: string, fallbackLabel: string) {
  return () => getDropdownContent(toolKey)?.() ?? dropdownPlaceholder(fallbackLabel)();
}

/** 具体功能实现的 Dropdown：字体颜色色板 */
function fontColorDropdownRender() {
  return React.createElement(FontColorDropdownContent, { command: 'format.fontColor' });
}

/** 开始 Tab：剪贴板、字体、段落、样式、编辑 */
const startGroups: ToolGroupConfig[] = [
  {
    key: 'clipboard',
    rows: 1,
    tools: [
      { key: 'formatPainter', label: '格式刷', type: 'button', command: 'format.painter', tooltip: '格式刷' },
      {
        key: 'paste',
        label: '粘贴',
        type: 'dropdown',
        command: 'edit.paste',
        tooltip: '粘贴',
        dropdownRender: dropdownFromPlugin('paste', '粘贴'),
      },
      { key: 'cut', label: '剪切', type: 'button', command: 'edit.cut', tooltip: '剪切' },
    ],
  },
  {
    key: 'font',
    rows: 2,
    tools: [
      {
        key: 'font',
        label: '字体',
        type: 'select',
        command: 'format.font',
        options: [
          { value: 'arial', label: 'Arial' },
          { value: 'simsun', label: '宋体' },
          { value: 'simhei', label: '黑体' },
        ],
        value: 'arial',
        rowIndex: 0,
      },
      {
        key: 'fontSize',
        label: '字号',
        type: 'select',
        command: 'format.fontSize',
        options: [
          { value: '12', label: '12' },
          { value: '14', label: '14' },
          { value: '16', label: '16' },
          { value: 'w5', label: '五号' },
        ],
        value: 'w5',
        rowIndex: 0,
      },
      { key: 'fontLarger', label: 'A+', type: 'button', command: 'format.fontLarger', rowIndex: 0 },
      { key: 'fontSmaller', label: 'A-', type: 'button', command: 'format.fontSmaller', rowIndex: 0 },
      {
        key: 'case',
        label: '大小写',
        type: 'dropdown',
        command: 'format.case',
        dropdownRender: dropdownPlaceholder('大小写'),
        rowIndex: 0,
      },
      { key: 'clearFormat', label: '清除格式', type: 'button', command: 'format.clear', rowIndex: 0 },
      { key: 'bold', label: 'B', type: 'button', command: 'format.bold', rowIndex: 1 },
      { key: 'italic', label: 'I', type: 'button', command: 'format.italic', rowIndex: 1 },
      {
        key: 'underline',
        label: 'U',
        type: 'dropdown',
        command: 'format.underline',
        dropdownRender: dropdownPlaceholder('下划线'),
        rowIndex: 1,
      },
      {
        key: 'strikethrough',
        label: '删除线',
        type: 'dropdown',
        command: 'format.strikethrough',
        dropdownRender: dropdownPlaceholder('删除线'),
        rowIndex: 1,
      },
      {
        key: 'highlight',
        label: '突出显示',
        type: 'dropdown',
        command: 'format.highlight',
        dropdownRender: dropdownPlaceholder('突出显示'),
        rowIndex: 1,
      },
      {
        key: 'fontColor',
        label: '字体颜色',
        type: 'dropdown',
        command: 'format.fontColor',
        dropdownRender: fontColorDropdownRender,
        rowIndex: 1,
      },
    ],
  },
  {
    key: 'paragraph',
    rows: 2,
    tools: [
      {
        key: 'bulletList',
        label: '项目符号',
        type: 'dropdown',
        command: 'format.bulletList',
        dropdownRender: dropdownPlaceholder('项目符号'),
        rowIndex: 0,
      },
      {
        key: 'numberList',
        label: '编号',
        type: 'dropdown',
        command: 'format.numberList',
        dropdownRender: dropdownPlaceholder('编号'),
        rowIndex: 0,
      },
      { key: 'indentDecrease', label: '减少缩进', type: 'button', command: 'format.indentDecrease', rowIndex: 0 },
      { key: 'indentIncrease', label: '增加缩进', type: 'button', command: 'format.indentIncrease', rowIndex: 0 },
      { key: 'alignLeft', label: '左对齐', type: 'button', command: 'format.alignLeft', rowIndex: 1 },
      { key: 'alignCenter', label: '居中', type: 'button', command: 'format.alignCenter', rowIndex: 1 },
      { key: 'alignRight', label: '右对齐', type: 'button', command: 'format.alignRight', rowIndex: 1 },
      { key: 'alignJustify', label: '两端对齐', type: 'button', command: 'format.alignJustify', rowIndex: 1 },
    ],
  },
  {
    key: 'styles',
    rows: 1,
    tools: [
      { key: 'styleBody', label: '正文', type: 'button', command: 'style.body' },
      { key: 'styleH1', label: '标题 1', type: 'button', command: 'style.h1' },
      { key: 'styleH2', label: '标题 2', type: 'button', command: 'style.h2' },
      {
        key: 'styleSet',
        label: '样式集',
        type: 'dropdown',
        command: 'style.set',
        dropdownRender: dropdownPlaceholder('样式集'),
      },
    ],
  },
  {
    key: 'editing',
    rows: 1,
    tools: [
      {
        key: 'findReplace',
        label: '查找替换',
        type: 'dropdown',
        command: 'edit.findReplace',
        dropdownRender: dropdownPlaceholder('查找替换'),
      },
      {
        key: 'select',
        label: '选择',
        type: 'dropdown',
        command: 'edit.select',
        dropdownRender: dropdownPlaceholder('选择'),
      },
    ],
  },
];

/** 插入 Tab */
const insertGroups: ToolGroupConfig[] = [
  {
    key: 'page',
    rows: 2,
    tools: [
      {
        key: 'blankPage',
        label: '空白页',
        type: 'dropdown',
        command: 'insert.blankPage',
        rowIndex: 0,
        dropdownRender: dropdownPlaceholder('空白页'),
      },
      {
        key: 'cover',
        label: '封面',
        type: 'dropdown',
        command: 'insert.cover',
        dropdownRender: dropdownPlaceholder('封面'),
        rowIndex: 0,
      },
      { key: 'pageBreak', label: '分页', type: 'button', command: 'insert.pageBreak', rowIndex: 1 },
      {
        key: 'pageNumber',
        label: '页码',
        type: 'dropdown',
        command: 'insert.pageNumber',
        dropdownRender: dropdownPlaceholder('页码'),
        rowIndex: 1,
      },
      { key: 'headerFooter', label: '页眉页脚', type: 'button', command: 'insert.headerFooter', rowIndex: 1 },
    ],
  },
  {
    key: 'tableMedia',
    rows: 2,
    tools: [
      {
        key: 'table',
        label: '表格',
        type: 'dropdown',
        command: 'insert.table',
        dropdownRender: dropdownPlaceholder('表格'),
        rowIndex: 0,
      },
      {
        key: 'image',
        label: '图片',
        type: 'dropdown',
        command: 'insert.image',
        dropdownRender: dropdownPlaceholder('图片'),
        rowIndex: 0,
      },
      {
        key: 'shape',
        label: '形状',
        type: 'dropdown',
        command: 'insert.shape',
        dropdownRender: dropdownPlaceholder('形状'),
        rowIndex: 1,
      },
      {
        key: 'textBox',
        label: '文本框',
        type: 'dropdown',
        command: 'insert.textBox',
        dropdownRender: dropdownPlaceholder('文本框'),
        rowIndex: 1,
      },
      { key: 'chart', label: '图表', type: 'button', command: 'insert.chart', rowIndex: 1 },
    ],
  },
  {
    key: 'symbol',
    rows: 1,
    tools: [
      {
        key: 'symbol',
        label: '符号',
        type: 'dropdown',
        command: 'insert.symbol',
        dropdownRender: dropdownPlaceholder('符号'),
      },
      {
        key: 'equation',
        label: '公式',
        type: 'dropdown',
        command: 'insert.equation',
        dropdownRender: dropdownPlaceholder('公式'),
      },
    ],
  },
  {
    key: 'link',
    rows: 1,
    tools: [
      { key: 'comment', label: '批注', type: 'button', command: 'insert.comment' },
      { key: 'link', label: '超链接', type: 'button', command: 'insert.link' },
    ],
  },
];

/** 页面 Tab */
const pageGroups: ToolGroupConfig[] = [
  {
    key: 'margin',
    rows: 2,
    tools: [
      {
        key: 'marginTop',
        label: '上',
        type: 'inputNumber',
        command: 'page.marginTop',
        min: 0,
        max: 10,
        step: 0.1,
        suffix: 'cm',
        rowIndex: 0,
      },
      {
        key: 'marginBottom',
        label: '下',
        type: 'inputNumber',
        command: 'page.marginBottom',
        min: 0,
        max: 10,
        step: 0.1,
        suffix: 'cm',
        rowIndex: 0,
      },
      {
        key: 'marginLeft',
        label: '左',
        type: 'inputNumber',
        command: 'page.marginLeft',
        min: 0,
        max: 10,
        step: 0.1,
        suffix: 'cm',
        rowIndex: 1,
      },
      {
        key: 'marginRight',
        label: '右',
        type: 'inputNumber',
        command: 'page.marginRight',
        min: 0,
        max: 10,
        step: 0.1,
        suffix: 'cm',
        rowIndex: 1,
      },
    ],
  },
  {
    key: 'paper',
    rows: 1,
    tools: [
      {
        key: 'orientation',
        label: '纸张方向',
        type: 'dropdown',
        command: 'page.orientation',
        dropdownRender: dropdownPlaceholder('纸张方向'),
      },
      {
        key: 'paperSize',
        label: '纸张大小',
        type: 'dropdown',
        command: 'page.paperSize',
        dropdownRender: dropdownPlaceholder('纸张大小'),
      },
    ],
  },
  {
    key: 'appearance',
    rows: 1,
    tools: [
      {
        key: 'theme',
        label: '主题',
        type: 'dropdown',
        command: 'page.theme',
        dropdownRender: dropdownPlaceholder('主题'),
      },
      {
        key: 'watermark',
        label: '水印',
        type: 'dropdown',
        command: 'page.watermark',
        dropdownRender: dropdownPlaceholder('水印'),
      },
    ],
  },
];

/** 引用 Tab */
const referenceGroups: ToolGroupConfig[] = [
  {
    key: 'toc',
    rows: 1,
    tools: [
      { key: 'toc', label: '目录', type: 'dropdown', command: 'ref.toc', dropdownRender: dropdownPlaceholder('目录') },
      { key: 'updateToc', label: '更新目录', type: 'button', command: 'ref.updateToc' },
    ],
  },
  {
    key: 'footnote',
    rows: 1,
    tools: [
      { key: 'insertFootnote', label: '插入脚注', type: 'button', command: 'ref.footnote' },
      { key: 'insertEndnote', label: '插入尾注', type: 'button', command: 'ref.endnote' },
    ],
  },
];

/** 审阅 Tab */
const reviewGroups: ToolGroupConfig[] = [
  {
    key: 'review',
    rows: 1,
    tools: [
      { key: 'comment', label: '插入批注', type: 'button', command: 'review.comment' },
      {
        key: 'track',
        label: '修订',
        type: 'dropdown',
        command: 'review.track',
        dropdownRender: dropdownPlaceholder('修订'),
      },
      {
        key: 'accept',
        label: '接受',
        type: 'dropdown',
        command: 'review.accept',
        dropdownRender: dropdownPlaceholder('接受'),
      },
      {
        key: 'reject',
        label: '拒绝',
        type: 'dropdown',
        command: 'review.reject',
        dropdownRender: dropdownPlaceholder('拒绝'),
      },
    ],
  },
];

/** 视图 Tab */
const viewGroups: ToolGroupConfig[] = [
  {
    key: 'display',
    rows: 1,
    tools: [
      { key: 'fullscreen', label: '全屏显示', type: 'button', command: 'view.fullscreen' },
      { key: 'pageView', label: '页面', type: 'button', command: 'view.page' },
      { key: 'outline', label: '大纲', type: 'button', command: 'view.outline' },
    ],
  },
  {
    key: 'showHide',
    rows: 1,
    tools: [
      { key: 'ruler', label: '标尺', type: 'checkbox', command: 'view.ruler', checked: false },
      { key: 'grid', label: '网格线', type: 'checkbox', command: 'view.grid', checked: false },
    ],
  },
  {
    key: 'zoom',
    rows: 1,
    tools: [
      {
        key: 'zoom',
        label: '显示比例',
        type: 'select',
        command: 'view.zoom',
        options: [
          { value: '75', label: '75%' },
          { value: '100', label: '100%' },
          { value: '125', label: '125%' },
          { value: '150', label: '150%' },
        ],
        value: '100',
      },
    ],
  },
];

/** 工具 Tab */
const toolsGroups: ToolGroupConfig[] = [
  {
    key: 'table',
    rows: 1,
    tools: [
      { key: 'insertRow', label: '插入行', type: 'button', command: 'table.insertRow' },
      { key: 'insertCol', label: '插入列', type: 'button', command: 'table.insertCol' },
      { key: 'merge', label: '合并单元格', type: 'button', command: 'table.merge' },
    ],
  },
  {
    key: 'efficiency',
    rows: 1,
    tools: [
      { key: 'template', label: '模板', type: 'button', command: 'tools.template' },
      { key: 'snippet', label: '片段', type: 'button', command: 'tools.snippet' },
    ],
  },
];

export const tabToolbarConfig: TabItemConfig[] = [
  {
    key: 'file',
    label: '文件',
    tools: [
      { key: 'new', label: '新建' },
      { key: 'open', label: '打开' },
      { key: 'save', label: '保存' },
      { key: 'export', label: '导出' },
    ],
  },
  { key: 'start', label: '开始', groups: startGroups },
  { key: 'insert', label: '插入', groups: insertGroups },
  { key: 'page', label: '页面', groups: pageGroups },
  { key: 'reference', label: '引用', groups: referenceGroups },
  { key: 'review', label: '审阅', groups: reviewGroups },
  { key: 'view', label: '视图', groups: viewGroups },
  { key: 'tools', label: '工具', groups: toolsGroups },
];

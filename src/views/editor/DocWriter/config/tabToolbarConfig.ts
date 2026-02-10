/**
 * Tab 工具栏配置（可在此扩展或从接口加载）
 * 类似 WPS：文件、开始、页面、插入、审阅、视图、表格、效率工具 等
 */
import type { TabItemConfig } from '../types';

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
  {
    key: 'start',
    label: '开始',
    tools: [
      { key: 'paste', label: '粘贴' },
      { key: 'font', label: '字体' },
      { key: 'fontSize', label: '字号' },
      { key: 'bold', label: '加粗' },
      { key: 'italic', label: '斜体' },
      { key: 'underline', label: '下划线' },
    ],
  },
  {
    key: 'page',
    label: '页面',
    tools: [
      { key: 'margin', label: '页边距' },
      { key: 'paperSize', label: '纸张大小' },
      { key: 'orientation', label: '纸张方向' },
      { key: 'pageNumber', label: '插入页码' },
      { key: 'pageBreak', label: '插入分页符' },
      { key: 'outline', label: '大纲' },
      { key: 'ruler', label: '标尺' },
      { key: 'watermark', label: '水印' },
      { key: 'shading', label: '底纹' },
      { key: 'grid', label: '网格线' },
      { key: 'gutter', label: '装订线' },
      { key: 'pageLayout', label: '页面布局' },
    ],
  },
  {
    key: 'insert',
    label: '插入',
    tools: [
      { key: 'table', label: '表格' },
      { key: 'image', label: '图片' },
      { key: 'chart', label: '图表' },
      { key: 'link', label: '链接' },
    ],
  },
  {
    key: 'review',
    label: '审阅',
    tools: [
      { key: 'comment', label: '批注' },
      { key: 'track', label: '修订' },
    ],
  },
  {
    key: 'view',
    label: '视图',
    tools: [
      { key: 'zoom', label: '缩放' },
      { key: 'ruler', label: '标尺' },
      { key: 'grid', label: '网格线' },
    ],
  },
  {
    key: 'table',
    label: '表格',
    tools: [
      { key: 'insertRow', label: '插入行' },
      { key: 'insertCol', label: '插入列' },
      { key: 'merge', label: '合并单元格' },
    ],
  },
  {
    key: 'efficiency',
    label: '效率工具',
    tools: [
      { key: 'template', label: '模板' },
      { key: 'snippet', label: '片段' },
    ],
  },
];

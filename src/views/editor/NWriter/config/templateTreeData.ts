/**
 * 左侧病历分类与模板树静态数据
 * 后续可改为从接口加载
 */
import type { TemplateTreeNode } from '../types';

export const templateTreeData: TemplateTreeNode[] = [
  {
    key: 'in-out',
    title: '入出院记录',
    children: [
      { key: 'in-out-24h', title: '24小时内入出院记录', isTemplate: true },
      { key: 'in-out-normal', title: '入院记录', isTemplate: true },
      { key: 'discharge', title: '出院记录', isTemplate: true },
    ],
  },
  {
    key: 'course',
    title: '病程记录',
    children: [
      { key: 'first-course', title: '首次病程记录', isTemplate: true },
      { key: 'daily-course', title: '日常病程记录', isTemplate: true },
      { key: 'round', title: '上级医师查房记录', isTemplate: true },
    ],
  },
  {
    key: 'operation',
    title: '手术相关',
    children: [
      { key: 'op-consent', title: '手术知情同意书', isTemplate: true },
      { key: 'op-record', title: '手术记录', isTemplate: true },
      { key: 'op-after', title: '术后病程记录', isTemplate: true },
    ],
  },
  {
    key: 'other',
    title: '其他',
    children: [
      { key: 'consult', title: '会诊记录', isTemplate: true },
      { key: 'transfer', title: '转科记录', isTemplate: true },
    ],
  },
];

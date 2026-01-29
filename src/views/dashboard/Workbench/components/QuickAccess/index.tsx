import {
  BookOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  MonitorOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import type { QuickAccessItem } from '../../mockData';
import styles from './QuickAccess.module.scss';

// 定义每个功能的主题色配置
const getQuickAccessConfig = (index: number) => {
  const configs = [
    {
      // 新建流程 - 活力蓝色，代表创新和开始
      themeClass: styles.themeBlue,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorderColor: 'hover:border-blue-400',
      hoverBgColor: 'hover:bg-blue-100',
    },
    {
      // 流程模板库 - 知识绿色，代表学习和资源
      themeClass: styles.themeEmerald,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      hoverBorderColor: 'hover:border-emerald-400',
      hoverBgColor: 'hover:bg-emerald-100',
    },
    {
      // 流程监控 - 专业紫色，代表监控和分析
      themeClass: styles.themePurple,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorderColor: 'hover:border-purple-400',
      hoverBgColor: 'hover:bg-purple-100',
    },
    {
      // 节点管理 - 活力橙色，代表配置和设置
      themeClass: styles.themeOrange,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverBorderColor: 'hover:border-orange-400',
      hoverBgColor: 'hover:bg-orange-100',
    },
    {
      // 操作日志 - 警示红色，代表记录和审计
      themeClass: styles.themeRed,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverBorderColor: 'hover:border-red-400',
      hoverBgColor: 'hover:bg-red-100',
    },
    {
      // 系统状态 - 科技青色，代表系统和状态
      themeClass: styles.themeCyan,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      hoverBorderColor: 'hover:border-cyan-400',
      hoverBgColor: 'hover:bg-cyan-100',
    },
  ];

  return configs[index % configs.length];
};

// 模拟获取快捷入口数据的API
const fetchQuickAccessData = async (): Promise<QuickAccessItem[]> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      icon: React.createElement(PlusOutlined, { className: 'text-2xl' }),
      title: '新建流程',
      description: '创建新的工作流程',
      link: '/workflow/create',
    },
    {
      icon: React.createElement(BookOutlined, { className: 'text-2xl' }),
      title: '流程模板库',
      description: '查看和选择流程模板',
      link: '/workflow/templates',
    },
    {
      icon: React.createElement(MonitorOutlined, { className: 'text-2xl' }),
      title: '流程监控',
      description: '实时监控流程运行状态',
      link: '/workflow/monitor',
    },
    {
      icon: React.createElement(SettingOutlined, { className: 'text-2xl' }),
      title: '节点管理',
      description: '管理和配置流程节点',
      link: '/workflow/nodes',
    },
    {
      icon: React.createElement(FileSearchOutlined, { className: 'text-2xl' }),
      title: '操作日志',
      description: '查看系统操作记录',
      link: '/system/logs',
    },
    {
      icon: React.createElement(CheckCircleOutlined, { className: 'text-2xl' }),
      title: '系统状态',
      description: '查看系统整体运行状态',
      link: '/system/status',
    },
  ];
};

export const QuickAccess: React.FC = () => {
  const { data: quickAccess, isFetching } = useQuery({
    queryKey: ['quickAccessData'],
    queryFn: fetchQuickAccessData,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  if (isFetching) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!quickAccess || quickAccess.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无快捷入口数据</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {quickAccess.map((item, index) => {
        const config = getQuickAccessConfig(index);

        return (
          <div
            key={`quick-${item.title}-${index}`}
            className={`${styles.quickAccessCard} group cursor-pointer p-2 rounded-lg border transition-all duration-300 ${config.bgColor} ${config.borderColor} ${config.hoverBorderColor} ${config.hoverBgColor}`}
          >
            <div className="flex flex-col items-center text-center">
              {/* 图标容器 */}
              <div className={`${styles.iconContainer} ${config.themeClass}`}>
                <div className={styles.icon}>{item.icon}</div>
              </div>

              {/* 标题 */}
              <div className={`${styles.cardTitle} group-hover:text-gray-900 transition-colors duration-200`}>
                {item.title}
              </div>

              {/* 描述 */}
              <div className={`${styles.cardDescription} group-hover:text-gray-700 transition-colors duration-200`}>
                {item.description}
              </div>

              {/* 悬停指示器 */}
              <div className={`${styles.hoverIndicator} ${config.themeClass}`} />
            </div>

            {/* 光晕效果 */}
            <div className={`${styles.cardGlow} ${config.themeClass}`} />
          </div>
        );
      })}
    </div>
  );
};

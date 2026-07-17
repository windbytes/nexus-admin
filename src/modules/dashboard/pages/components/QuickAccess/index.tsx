import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { fetchQuickAccessData } from '@/modules/dashboard/api';
import styles from './QuickAccess.module.css';

const getQuickAccessConfig = (index: number) => {
  const configs = [
    {
      themeClass: styles.themeBlue,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorderColor: 'hover:border-blue-400',
      hoverBgColor: 'hover:bg-blue-100',
    },
    {
      themeClass: styles.themeEmerald,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      hoverBorderColor: 'hover:border-emerald-400',
      hoverBgColor: 'hover:bg-emerald-100',
    },
    {
      themeClass: styles.themePurple,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorderColor: 'hover:border-purple-400',
      hoverBgColor: 'hover:bg-purple-100',
    },
    {
      themeClass: styles.themeOrange,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverBorderColor: 'hover:border-orange-400',
      hoverBgColor: 'hover:bg-orange-100',
    },
    {
      themeClass: styles.themeRed,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverBorderColor: 'hover:border-red-400',
      hoverBgColor: 'hover:bg-red-100',
    },
    {
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

export const QuickAccess: React.FC = () => {
  const { data: quickAccess, isFetching } = useQuery({
    queryKey: ['quickAccessData'],
    queryFn: fetchQuickAccessData,
    staleTime: 5 * 60 * 1000,
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
              <div className={`${styles.iconContainer} ${config.themeClass}`}>
                <div className={styles.icon}>{item.icon}</div>
              </div>
              <div className={`${styles.cardTitle} group-hover:text-gray-900 transition-colors duration-200`}>
                {item.title}
              </div>
              <div className={`${styles.cardDescription} group-hover:text-gray-700 transition-colors duration-200`}>
                {item.description}
              </div>
              <div className={`${styles.hoverIndicator} ${config.themeClass}`} />
            </div>
            <div className={`${styles.cardGlow} ${config.themeClass}`} />
          </div>
        );
      })}
    </div>
  );
};

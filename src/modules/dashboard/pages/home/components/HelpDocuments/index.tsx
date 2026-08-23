import { useQuery } from '@tanstack/react-query';
import { Divider } from 'antd';
import type React from 'react';
import { fetchHelpDocumentsData } from '@/modules/dashboard/api';

export const HelpDocuments: React.FC = () => {
  const { data: helpDocuments, isFetching } = useQuery({
    queryKey: ['helpDocumentsData'],
    queryFn: fetchHelpDocumentsData,
    staleTime: 5 * 60 * 1000,
  });

  if (isFetching) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-3 bg-gray-200 rounded mb-1" />
          <div className="h-3 bg-gray-200 rounded mb-1" />
          <div className="h-3 bg-gray-200 rounded" />
        </div>
        <Divider />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!helpDocuments || helpDocuments.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无帮助文档</div>;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-base font-semibold text-gray-800 mb-3">帮助文档</h4>
      <div className="space-y-2">
        {helpDocuments.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors duration-200"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
            <span className="text-sm text-blue-600 hover:text-blue-800">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

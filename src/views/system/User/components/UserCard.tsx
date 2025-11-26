import { Card } from 'antd';
import { memo, type ReactNode } from 'react';

interface UserCardProps {
  selectedCount: number;
  children: ReactNode;
}

/**
 * 用户列表卡片容器组件
 */
const UserCard = memo<UserCardProps>(({ selectedCount, children }) => {
  return (
    <Card
      className="flex-1 min-h-0 flex flex-col"
      title={
        <div className="flex items-center justify-between">
          <span>用户列表</span>
          <span className="text-sm text-gray-500">已选择 {selectedCount} 项</span>
        </div>
      }
      styles={{
        body: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
        },
      }}
    >
      {children}
    </Card>
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;

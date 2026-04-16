import { ReloadOutlined } from '@ant-design/icons';
import { Button, Descriptions, Drawer, Empty, Space, Statistic } from 'antd';
import type React from 'react';
import { memo } from 'react';
import type { ConnectionPoolStats } from '@/services/connection/database/type';

interface PoolStatsDrawerProps {
  open: boolean;
  connectionName?: string;
  stats?: ConnectionPoolStats;
  loading?: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

const PoolStatsDrawer: React.FC<PoolStatsDrawerProps> = memo(
  ({ open, connectionName, stats, loading = false, onRefresh, onClose }) => {
    return (
      <Drawer
        title={`连接池运行态${connectionName ? ` - ${connectionName}` : ''}`}
        open={open}
        width={560}
        onClose={onClose}
        destroyOnClose
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} loading={loading} onClick={onRefresh}>
              刷新
            </Button>
          </Space>
        }
      >
        {!stats ? (
          <Empty description="暂无连接池指标" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Statistic title="活跃连接数" value={stats.activeCount} />
              <Statistic title="空闲连接数" value={stats.poolingCount} />
              <Statistic title="等待线程数" value={stats.waitThreadCount} />
              <Statistic title="最大连接数" value={stats.maxActive} />
            </div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="连接ID">{stats.connectionId}</Descriptions.Item>
              <Descriptions.Item label="业务状态">{stats.enabled ? '启用' : '停用'}</Descriptions.Item>
              <Descriptions.Item label="连接池状态">{stats.poolInitialized ? '已初始化' : '未初始化'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    );
  }
);

PoolStatsDrawer.displayName = 'ConnectionPoolStatsDrawer';

export default PoolStatsDrawer;

import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import { Button, Drawer, Empty, Input, Select, Space, Table, Tag, Typography } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

interface LogRecord {
  id: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  timestamp: string;
  operator: string;
  details?: string;
}

interface EndpointLogDrawerProps {
  /** 是否显示 */
  open: boolean;
  /** 端点信息 */
  endpoint: Endpoint | null;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 端点日志查看抽屉
 */
const EndpointLogDrawer: React.FC<EndpointLogDrawerProps> = ({ open, endpoint, onClose }) => {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /**
   * 获取日志级别配置
   */
  const getLevelConfig = (level: string) => {
    const configs = {
      info: { color: 'blue', icon: <ExclamationCircleOutlined />, text: '信息' },
      warn: { color: 'orange', icon: <ExclamationCircleOutlined />, text: '警告' },
      error: { color: 'red', icon: <CloseCircleOutlined />, text: '错误' },
      success: { color: 'green', icon: <CheckCircleOutlined />, text: '成功' },
    };
    return configs[level as keyof typeof configs] || configs.info;
  };

  /**
   * 加载日志数据（模拟）
   */
  const loadLogs = useCallback(() => {
    if (!endpoint) return;

    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      const mockLogs: LogRecord[] = [
        {
          id: '1',
          level: 'success',
          message: '端点连接测试成功',
          timestamp: new Date().toISOString(),
          operator: '管理员',
          details: '响应时间: 125ms',
        },
        {
          id: '2',
          level: 'info',
          message: '端点配置已更新',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          operator: '管理员',
          details: '修改了连接超时设置',
        },
        {
          id: '3',
          level: 'warn',
          message: '端点响应时间较慢',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          operator: '系统',
          details: '响应时间: 3500ms',
        },
        {
          id: '4',
          level: 'error',
          message: '端点连接失败',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          operator: '系统',
          details: '错误: Connection timeout',
        },
        {
          id: '5',
          level: 'success',
          message: '端点已启用',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          operator: '管理员',
        },
        {
          id: '6',
          level: 'info',
          message: '端点配置已创建',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          operator: '开发者',
          details: '初始版本',
        },
      ];

      // 过滤日志
      let filteredLogs = mockLogs;
      if (filterLevel !== 'all') {
        filteredLogs = filteredLogs.filter((log) => log.level === filterLevel);
      }
      if (searchText) {
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.message.toLowerCase().includes(searchText.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setLogs(filteredLogs);
      setPagination((prev) => ({ ...prev, total: filteredLogs.length }));
      setLoading(false);
    }, 500);
  }, [endpoint, filterLevel, searchText]);

  /**
   * 刷新日志
   */
  const handleRefresh = useCallback(() => {
    loadLogs();
  }, [loadLogs]);

  /**
   * 加载日志
   */
  useEffect(() => {
    if (open && endpoint) {
      loadLogs();
    }
  }, [open, endpoint, loadLogs]);

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => {
        const config = getLevelConfig(level);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      width: 200,
      ellipsis: true,
      render: (details: string) => <Text type="secondary">{details || '-'}</Text>,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString('zh-CN'),
    },
  ];

  return (
    <Drawer
      title={`操作日志 - ${endpoint?.name || ''}`}
      placement="right"
      size={900}
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        {/* 过滤器 */}
        <Space className="w-full" size="middle">
          <Select
            value={filterLevel}
            onChange={setFilterLevel}
            className="w-32"
            options={[
              { label: '全部', value: 'all' },
              { label: '成功', value: 'success' },
              { label: '信息', value: 'info' },
              { label: '警告', value: 'warn' },
              { label: '错误', value: 'error' },
            ]}
          />
          <Input
            placeholder="搜索日志内容"
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
        </Space>

        {/* 日志表格 */}
        {logs.length > 0 ? (
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={logs}
            loading={loading}
            pagination={pagination}
            onChange={(newPagination) => setPagination(newPagination)}
          />
        ) : (
          !loading && <Empty description="暂无日志记录" />
        )}
      </div>
    </Drawer>
  );
};

export default EndpointLogDrawer;


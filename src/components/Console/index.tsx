import { App, Button, Empty, Segmented, Space, Switch, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import { useUserStore } from '@/stores/userStore';
import webSocketClient, {
  type AnnouncementMessagePayload,
  type ParamMessagePayload,
  type SqlMessagePayload,
  type WebSocketConnectionStatus,
} from '@/utils/webscoketClient';

type MonitorMessageType = 'sql' | 'param' | 'announcement';

interface ConsoleLogItem {
  id: string;
  type: MonitorMessageType;
  title: string;
  description: string;
  timestamp: number;
}

const MAX_LOG_ITEMS = 200;
const MONITOR_CONSOLE_ENABLED = import.meta.env.VITE_ENABLE_MONITOR_CONSOLE !== 'false';
/**
 * 弹窗监控台
 * @returns
 */
const Console: React.FC = () => {
  const { message } = App.useApp();
  const accessToken = useUserStore((state) => state.accessToken);
  const [open, setOpen] = useState<boolean>(false);
  const [sqlEnabled, setSqlEnabled] = useState<boolean>(true);
  const [paramEnabled, setParamEnabled] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | MonitorMessageType>('all');
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>(webSocketClient.getStatus());
  const [logs, setLogs] = useState<ConsoleLogItem[]>([]);

  useEffect(() => {
    if (!MONITOR_CONSOLE_ENABLED || !accessToken) {
      return;
    }
    webSocketClient.connect(accessToken);
    return () => {
      webSocketClient.disconnect();
    };
  }, [accessToken]);

  useEffect(() => {
    // 初始化的时候绑定键盘事件
    document.addEventListener('keyup', keyupEvent, false);

    const handleStatus = (status: WebSocketConnectionStatus) => {
      setConnectionStatus(status);
    };
    const handleSqlMessage = (event: { payload: SqlMessagePayload; timestamp: number }) => {
      appendLog({
        type: 'sql',
        title: 'SQL 执行',
        description: `${event.payload.sql}\n参数: ${event.payload.queryParams || '无'}\n耗时: ${event.payload.elapsedText}`,
        timestamp: event.timestamp,
      });
    };
    const handleParamMessage = (event: { payload: ParamMessagePayload; timestamp: number }) => {
      const actionText = getParamActionText(event.payload.action);
      appendLog({
        type: 'param',
        title: `参数${actionText}: ${event.payload.name}`,
        description: `编码: ${event.payload.code}\n分类: ${event.payload.categoryName}\n值: ${event.payload.value || '-'}\n操作人: ${event.payload.operatorName || '-'}`,
        timestamp: event.timestamp,
      });
    };
    const handleAnnouncementMessage = (event: { payload: AnnouncementMessagePayload; timestamp: number }) => {
      appendLog({
        type: 'announcement',
        title: event.payload.title,
        description: `${event.payload.content}\n发布人: ${event.payload.publishedBy || '-'}`,
        timestamp: event.timestamp,
      });
    };
    const handleServerError = (event: { payload: { message: string } }) => {
      message.error(event.payload.message);
    };

    webSocketClient.on('status', handleStatus);
    webSocketClient.on('sql', handleSqlMessage);
    webSocketClient.on('param', handleParamMessage);
    webSocketClient.on('announcement', handleAnnouncementMessage);
    webSocketClient.on('serverError', handleServerError);

    return () => {
      // 销毁键盘事件
      document.removeEventListener('keyup', keyupEvent, false);
      webSocketClient.off('status', handleStatus);
      webSocketClient.off('sql', handleSqlMessage);
      webSocketClient.off('param', handleParamMessage);
      webSocketClient.off('announcement', handleAnnouncementMessage);
      webSocketClient.off('serverError', handleServerError);
    };
  }, []);

  useEffect(() => {
    if (!MONITOR_CONSOLE_ENABLED) {
      return;
    }
    webSocketClient.setMonitorPreferences({
      sqlEnabled: open && sqlEnabled,
      paramEnabled: open && paramEnabled,
    });
  }, [open, sqlEnabled, paramEnabled]);

  const filteredLogs = useMemo(() => {
    if (filterType === 'all') {
      return logs;
    }
    return logs.filter((item) => item.type === filterType);
  }, [filterType, logs]);

  if (!MONITOR_CONSOLE_ENABLED) {
    return null;
  }

  /**
   * 监听键盘事件
   * @param e
   */
  const keyupEvent = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      setOpen(false);
    }
    if (e.ctrlKey && e.code === 'F11') {
      setOpen((value) => !value);
    }
  };

  const appendLog = (item: Omit<ConsoleLogItem, 'id'>) => {
    setLogs((prev) =>
      [
        {
          ...item,
          id: `${item.type}-${item.timestamp}-${crypto.randomUUID()}`,
        },
        ...prev,
      ].slice(0, MAX_LOG_ITEMS)
    );
  };

  return (
    <DragModal
      open={open}
      classNames={{
        wrapper: 'position-unset!',
        container: 'absolute! top-14! right-[26px]! z-1000!',
        body: 'h-[calc(100vh-160px)]! border-1! border-solid! border-gray-200! p-2! rounded-md! bg-aliceblue!',
      }}
      title="监控台（Esc关闭）"
      width={380}
      footer={null}
      onCancel={() => setOpen(false)}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Space wrap size={[8, 8]}>
            <Tag color={getStatusColor(connectionStatus)}>连接: {getStatusText(connectionStatus)}</Tag>
            <Tag color="processing">公告始终接收</Tag>
          </Space>
          <Button size="small" onClick={() => setLogs([])}>
            清空
          </Button>
        </div>

        <div className="rounded-md border border-gray-200 p-2">
          <div className="mb-2 text-xs text-gray-500">开启后后端才会继续推送对应实时数据</div>
          <div className="flex flex-wrap items-center gap-3">
            <Space>
              <Switch checked={sqlEnabled} onChange={setSqlEnabled} size="small" />
              <span className="text-sm">接收 SQL</span>
            </Space>
            <Space>
              <Switch checked={paramEnabled} onChange={setParamEnabled} size="small" />
              <span className="text-sm">接收参数</span>
            </Space>
          </div>
        </div>

        <Segmented
          block
          value={filterType}
          onChange={(value) => setFilterType(value as 'all' | MonitorMessageType)}
          options={[
            { label: '全部', value: 'all' },
            { label: 'SQL', value: 'sql' },
            { label: '参数', value: 'param' },
            { label: '公告', value: 'announcement' },
          ]}
        />

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white p-2">
          {filteredLogs.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Empty description="暂无实时消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((item) => (
                <div key={item.id} className="rounded-md border border-gray-100 bg-gray-50 p-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <Space size={8}>
                      <Tag color={getMessageTagColor(item.type)}>{getMessageTagText(item.type)}</Tag>
                      <Typography.Text strong className="text-sm">
                        {item.title}
                      </Typography.Text>
                    </Space>
                    <Typography.Text type="secondary" className="text-xs">
                      {dayjs(item.timestamp).format('HH:mm:ss')}
                    </Typography.Text>
                  </div>
                  <Typography.Paragraph className="mb-0! text-xs whitespace-pre-wrap text-gray-700">
                    {item.description}
                  </Typography.Paragraph>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DragModal>
  );
};

function getStatusColor(status: WebSocketConnectionStatus) {
  switch (status) {
    case 'authenticated':
      return 'success';
    case 'connected':
      return 'processing';
    case 'connecting':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
}

function getStatusText(status: WebSocketConnectionStatus) {
  switch (status) {
    case 'authenticated':
      return '已鉴权';
    case 'connected':
      return '已连接';
    case 'connecting':
      return '重连中';
    case 'error':
      return '异常';
    default:
      return '未连接';
  }
}

function getMessageTagColor(type: MonitorMessageType) {
  switch (type) {
    case 'sql':
      return 'blue';
    case 'param':
      return 'purple';
    case 'announcement':
      return 'gold';
    default:
      return 'default';
  }
}

function getMessageTagText(type: MonitorMessageType) {
  switch (type) {
    case 'sql':
      return 'SQL';
    case 'param':
      return '参数';
    case 'announcement':
      return '公告';
    default:
      return '消息';
  }
}

function getParamActionText(action: ParamMessagePayload['action']) {
  switch (action) {
    case 'create':
      return '新增';
    case 'update':
      return '更新';
    case 'delete':
      return '删除';
    default:
      return '变更';
  }
}

export default Console;

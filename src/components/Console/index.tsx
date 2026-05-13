import { CloseOutlined } from '@ant-design/icons';
import { App, Button, Empty, Segmented, Space, Switch, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
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

interface PanelPersist {
  open: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 与后端 subscribe 对齐；持久化避免路由树/组件重挂后订阅丢失 */
  sqlEnabled: boolean;
  paramEnabled: boolean;
}

const MAX_LOG_ITEMS = 200;
const MONITOR_CONSOLE_ENABLED = import.meta.env.VITE_ENABLE_MONITOR_CONSOLE !== 'false';
const PANEL_STORAGE_KEY = 'syndra-monitoring-console-panel';
const DEFAULT_W = 380;
const DEFAULT_H = 560;
const MIN_W = 320;
const MIN_H = 240;

function readPersistedPanel(): Partial<PanelPersist> | null {
  try {
    const raw = sessionStorage.getItem(PANEL_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Partial<PanelPersist>;
  } catch {
    return null;
  }
}

function defaultPanelPosition() {
  if (typeof window === 'undefined') {
    return { x: 24, y: 56 };
  }
  return { x: Math.max(8, window.innerWidth - DEFAULT_W - 26), y: 56 };
}

function readInitialPanel(): PanelPersist {
  const saved = readPersistedPanel();
  const def = defaultPanelPosition();
  return {
    open: typeof saved?.open === 'boolean' ? saved.open : false,
    x: typeof saved?.x === 'number' ? saved.x : def.x,
    y: typeof saved?.y === 'number' ? saved.y : def.y,
    w: typeof saved?.w === 'number' ? Math.max(MIN_W, saved.w) : DEFAULT_W,
    h: typeof saved?.h === 'number' ? Math.max(MIN_H, saved.h) : DEFAULT_H,
    sqlEnabled: typeof saved?.sqlEnabled === 'boolean' ? saved.sqlEnabled : false,
    paramEnabled: typeof saved?.paramEnabled === 'boolean' ? saved.paramEnabled : false,
  };
}

/**
 * 浮动监控台：fixed 层叠，不挤占页面布局；可拖拽、可缩放；仅 Esc 或关闭按钮关闭（路由切换保持打开状态通过 sessionStorage 恢复）。
 */
const Console: React.FC = () => {
  const { message } = App.useApp();
  const accessToken = useUserStore((state) => state.accessToken);
  const initialPanel = useMemo(() => readInitialPanel(), []);
  const [open, setOpen] = useState(initialPanel.open);
  const [panelX, setPanelX] = useState(initialPanel.x);
  const [panelY, setPanelY] = useState(initialPanel.y);
  const [panelW, setPanelW] = useState(initialPanel.w);
  const [panelH, setPanelH] = useState(initialPanel.h);
  const [sqlEnabled, setSqlEnabled] = useState<boolean>(initialPanel.sqlEnabled);
  const [paramEnabled, setParamEnabled] = useState<boolean>(initialPanel.paramEnabled);
  const [filterType, setFilterType] = useState<'all' | MonitorMessageType>('all');
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>(webSocketClient.getStatus());
  const [logs, setLogs] = useState<ConsoleLogItem[]>([]);

  const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const dragNodeRef = useRef<HTMLDivElement>(null);
  /** 供 WebSocket status 回调读取最新开关，避免重连后仍用陈旧闭包 */
  const monitorPrefsRef = useRef({ open, sqlEnabled, paramEnabled });
  monitorPrefsRef.current = { open, sqlEnabled, paramEnabled };

  const appendLog = useCallback((item: Omit<ConsoleLogItem, 'id'>) => {
    setLogs((prev) =>
      [
        {
          ...item,
          id: `${item.type}-${item.timestamp}-${crypto.randomUUID()}`,
        },
        ...prev,
      ].slice(0, MAX_LOG_ITEMS)
    );
  }, []);

  useEffect(() => {
    if (!MONITOR_CONSOLE_ENABLED) {
      return;
    }
    const payload: PanelPersist = {
      open,
      x: panelX,
      y: panelY,
      w: panelW,
      h: panelH,
      sqlEnabled,
      paramEnabled,
    };
    try {
      sessionStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota */
    }
  }, [open, panelX, panelY, panelW, panelH, sqlEnabled, paramEnabled]);

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
    if (!MONITOR_CONSOLE_ENABLED) {
      return;
    }

    const handleStatus = (status: WebSocketConnectionStatus) => {
      setConnectionStatus(status);
      if (status === 'authenticated') {
        const p = monitorPrefsRef.current;
        webSocketClient.setMonitorPreferences({
          sqlEnabled: p.open && p.sqlEnabled,
          paramEnabled: p.open && p.paramEnabled,
        });
      }
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
      webSocketClient.off('status', handleStatus);
      webSocketClient.off('sql', handleSqlMessage);
      webSocketClient.off('param', handleParamMessage);
      webSocketClient.off('announcement', handleAnnouncementMessage);
      webSocketClient.off('serverError', handleServerError);
    };
  }, [appendLog, message]);

  useEffect(() => {
    if (!MONITOR_CONSOLE_ENABLED) {
      return;
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && open) {
        setOpen(false);
        return;
      }
      if (e.ctrlKey && e.code === 'F11') {
        setOpen((value) => !value);
      }
    };
    document.addEventListener('keyup', onKeyUp, false);
    return () => {
      document.removeEventListener('keyup', onKeyUp, false);
    };
  }, [open]);

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

  const onDragStart = useCallback((_e: DraggableEvent, uiData: DraggableData) => {
    const el = dragNodeRef.current;
    if (!el) {
      return;
    }
    const { clientWidth, clientHeight } = document.documentElement;
    const targetRect = el.getBoundingClientRect();
    setDragBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  }, []);

  const onResizeMouseDown = useCallback(
    (down: React.MouseEvent) => {
      down.preventDefault();
      down.stopPropagation();
      const startX = down.clientX;
      const startY = down.clientY;
      const startW = panelW;
      const startH = panelH;
      const maxW = typeof window !== 'undefined' ? window.innerWidth - 8 : startW;
      const maxH = typeof window !== 'undefined' ? window.innerHeight - 8 : startH;

      const onMove = (ev: MouseEvent) => {
        const nextW = Math.min(maxW, Math.max(MIN_W, startW + ev.clientX - startX));
        const nextH = Math.min(maxH, Math.max(MIN_H, startH + ev.clientY - startY));
        setPanelW(nextW);
        setPanelH(nextH);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [panelW, panelH]
  );

  if (!MONITOR_CONSOLE_ENABLED) {
    return null;
  }

  const floatingPanel =
    open &&
    createPortal(
      <div className="pointer-events-none fixed inset-0 z-[1100]" aria-hidden={!open}>
        <Draggable
          nodeRef={dragNodeRef}
          bounds={dragBounds}
          cancel=".monitor-console-no-drag"
          position={{ x: panelX, y: panelY }}
          onStart={onDragStart}
          onDrag={(_e, data) => {
            setPanelX(data.x);
            setPanelY(data.y);
          }}
        >
          <div
            ref={dragNodeRef}
            className="pointer-events-auto flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-[#f0f8ff] shadow-xl"
            style={{ width: panelW, height: panelH }}
            role="dialog"
            aria-label="监控台"
          >
            <div className="flex shrink-0 cursor-move items-center gap-2 border-b border-gray-200 bg-white px-2 py-1.5 select-none">
              <Typography.Text strong className="text-sm">
                监控台
              </Typography.Text>
              <Typography.Text type="secondary" className="text-xs">
                Ctrl+F11 开关 · Esc 或关闭按钮关闭
              </Typography.Text>
              <Button
                type="text"
                size="small"
                className="monitor-console-no-drag ml-auto text-gray-500"
                icon={<CloseOutlined />}
                aria-label="关闭监控台"
                onClick={() => setOpen(false)}
              />
            </div>

            <div className="monitor-console-no-drag flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-2">
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

            <button
              type="button"
              className="monitor-console-no-drag pointer-events-auto absolute right-0.5 bottom-0.5 h-4 w-4 cursor-nwse-resize touch-none border-0 bg-white p-0 shadow-sm"
              aria-label="调整监控台大小"
              onMouseDown={onResizeMouseDown}
            />
          </div>
        </Draggable>
      </div>,
      document.body
    );

  return <>{floatingPanel}</>;
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

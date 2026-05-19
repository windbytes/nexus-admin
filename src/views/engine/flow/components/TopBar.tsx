import {
  CheckOutlined,
  CloudUploadOutlined,
  HistoryOutlined,
  RedoOutlined,
  ReloadOutlined,
  SearchOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Badge, Button, Space, Tag, Tooltip, Typography } from 'antd';
import type { FlowRunStatusResponse } from '@/services/engine/flow/types';
import { useWorkflowStore } from '../store/workflowStore';

const { Text } = Typography;

interface TopBarProps {
  appId?: string;
  onPreview?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  onOpenVersionHistory?: () => void;
  checklistCount?: number;
  /** 流程运行状态（由 useWorkflowRunStatusQuery 提供，已从 RouteStatusDTO 映射） */
  runStatus?: FlowRunStatusResponse | null;
}

const RUN_STATUS_MAP: Record<string, { color: string; text: string }> = {
  idle: { color: 'default', text: '未运行' },
  running: { color: 'processing', text: '运行中' },
  success: { color: 'success', text: '成功' },
  failed: { color: 'error', text: '失败' },
};

/**
 * 流程编排顶部栏
 * 自动保存状态、appId、运行状态、撤销/重做、预览/搜索/检查清单/发布/刷新
 */
export const TopBar: React.FC<TopBarProps> = ({
  appId,
  onPreview,
  onSave,
  onPublish,
  onOpenVersionHistory,
  checklistCount = 0,
  runStatus,
}) => {
  const { lastSavedAt, dirty, undo, redo, canUndo, canRedo } = useWorkflowStore();

  const timeStr = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  return (
    <div className="workflow-top-bar">
      <Space size="middle">
        <Text type="secondary">自动保存 {timeStr}</Text>
        {dirty && <Tag color="orange">未发布</Tag>}
      </Space>

      <Space size="middle">
        <Text type="secondary">应用ID: {appId ?? '-'}</Text>
        {runStatus && (
          <Tooltip title={runStatus.message ?? runStatus.lastRunAt}>
            <Tag color={RUN_STATUS_MAP[runStatus.status]?.color ?? 'default'}>
              {RUN_STATUS_MAP[runStatus.status]?.text ?? runStatus.status}
            </Tag>
          </Tooltip>
        )}
      </Space>

      <Space size="small">
        <Space.Compact block>
          <Button icon={<UndoOutlined />} disabled={!canUndo()} onClick={undo} title="撤销" />
          <Button icon={<SearchOutlined />} onClick={onPreview} title="预览" />
          <Badge count={checklistCount}>
            <Button icon={<CheckOutlined />} title="检查清单" />
          </Badge>
        </Space.Compact>

        <Button onClick={onSave}>保存</Button>
        <Button type="primary" icon={<CloudUploadOutlined />} onClick={onPublish}>
          发布
        </Button>
        <Button icon={<HistoryOutlined />} onClick={onOpenVersionHistory} title="版本历史" />
        <Button icon={<RedoOutlined />} disabled={!canRedo()} onClick={redo} title="重做" />
        <Button icon={<ReloadOutlined />} title="刷新" />
      </Space>
    </div>
  );
};

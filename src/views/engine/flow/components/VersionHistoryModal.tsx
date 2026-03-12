/**
 * 版本历史弹窗：展示版本列表（分页），支持回滚
 * 使用 flow API：flowVersionService.listVersions(flowId) 返回 Page<FlowVersionDTO>
 */
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal, message, Table } from 'antd';
import { useCallback, useState } from 'react';
import { flowVersionService } from '@/services/engine/flow/api';
import type { FlowVersionDTO } from '@/services/engine/flow/types';

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  /** 流程定义 ID（用于版本列表与回滚接口） */
  flowId: string;
}

const PAGE_SIZE = 20;

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ open, onClose, flowId }) => {
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<FlowVersionDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const loadVersions = useCallback(
    async (pageNum: number = 1) => {
      if (!flowId) {
        return;
      }
      setLoadingList(true);
      try {
        const result = await flowVersionService.listVersions(flowId, pageNum, PAGE_SIZE);
        setVersions(result.records ?? []);
        setTotal(result.totalRow ?? 0);
        setPage(pageNum);
      } finally {
        setLoadingList(false);
      }
    },
    [flowId]
  );

  const handleRollback = useCallback(
    async (version: number) => {
      if (!flowId) {
        return;
      }
      setLoading(true);
      try {
        await flowVersionService.rollback(flowId, version);
        message.success('回滚成功');
        onClose();
        void queryClient.invalidateQueries({ queryKey: ['workflow'] });
        void loadVersions(1);
      } catch {
        message.error('回滚失败');
      } finally {
        setLoading(false);
      }
    },
    [flowId, onClose, queryClient, loadVersions]
  );

  return (
    <Modal
      title="版本历史"
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      afterOpenChange={(visible) => visible && void loadVersions(1)}
    >
      <Table<FlowVersionDTO>
        size="small"
        loading={loadingList}
        dataSource={versions}
        rowKey="version"
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          onChange: (p) => void loadVersions(p),
        }}
        columns={[
          { title: '版本号', dataIndex: 'version', width: 80 },
          { title: '标签', dataIndex: 'versionTag', ellipsis: true },
          { title: '状态', dataIndex: 'status', width: 100 },
          {
            title: '发布时间',
            dataIndex: 'publishedTime',
            width: 160,
            render: (t: string) => (t ? new Date(t).toLocaleString() : '-'),
          },
          {
            title: '操作',
            width: 80,
            render: (_, record) => (
              <Button type="link" size="small" loading={loading} onClick={() => handleRollback(record.version)}>
                回滚
              </Button>
            ),
          },
        ]}
      />
    </Modal>
  );
};

/**
 * 版本历史弹窗：展示版本列表，支持回滚
 */
import { useQueryClient } from '@tanstack/react-query';
import { Button, message, Modal, Table } from 'antd';
import { useCallback, useState } from 'react';
import { workflowService } from '@/services/integrated/workflow/workflowApi';
import type { FlowVersionDTO } from '@/services/integrated/workflow/type';

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  appId: string;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ open, onClose, appId }) => {
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<FlowVersionDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const queryClient = useQueryClient();

  const loadVersions = useCallback(async () => {
    if (!appId) {
      return;
    }
    setLoadingList(true);
    try {
      const list = await workflowService.listVersions(appId, 1, 50);
      setVersions(list);
    } finally {
      setLoadingList(false);
    }
  }, [appId]);

  const handleRollback = useCallback(
    async (versionNo: number) => {
      if (!appId) {
        return;
      }
      setLoading(true);
      try {
        await workflowService.rollback(appId, versionNo);
        message.success('回滚成功');
        onClose();
        void queryClient.invalidateQueries({ queryKey: ['workflow-config', appId] });
      } catch {
        message.error('回滚失败');
      } finally {
        setLoading(false);
      }
    },
    [appId, onClose, queryClient]
  );

  return (
    <Modal
      title="版本历史"
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      afterOpenChange={(visible) => visible && void loadVersions()}
    >
      <Table<FlowVersionDTO>
        size="small"
        loading={loadingList}
        dataSource={versions}
        rowKey="versionNo"
        pagination={false}
        columns={[
          { title: '版本号', dataIndex: 'versionNo', width: 80 },
          { title: '标签', dataIndex: 'versionTag', ellipsis: true },
          { title: '节点数', dataIndex: 'nodeCount', width: 80 },
          { title: '状态', dataIndex: 'status', width: 80 },
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
              <Button
                type="link"
                size="small"
                loading={loading}
                onClick={() => handleRollback(record.versionNo)}
              >
                回滚
              </Button>
            ),
          },
        ]}
      />
    </Modal>
  );
};

import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import { useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import { userService } from '@/services/system/user/userApi';
import type { UserSearchParams } from '../types';

/**
 * 回收站
 * @returns
 */
const RecycleModal: React.FC<RecycleModalProps> = ({ visible, onCancel, onOk }) => {
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    pageNum: 1,
    pageSize: 10,
  });

  // 查询回收站数据
  const { isFetching, data, refetch } = useQuery({
    queryKey: ['sys_user_recycle', searchParams],
    queryFn: () => userService.queryRecycleUserListPage(searchParams),
    enabled: visible,
  });

  return (
    <DragModal
      open={visible}
      onCancel={onCancel}
      title="回收站"
      width={800}
      height={600}
      loading={isFetching}
      footer={
        <div className="flex justify-end">
          <Button type="primary" onClick={onOk}>
            关闭
          </Button>
        </div>
      }
    >
      回收站内容
    </DragModal>
  );
};
export default RecycleModal;

interface RecycleModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

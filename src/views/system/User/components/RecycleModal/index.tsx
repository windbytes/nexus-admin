import { useQuery } from '@tanstack/react-query';
import { Button, Space } from 'antd';
import { isEqual } from 'lodash-es';
import type { Key } from 'react';
import { useEffect, useState } from 'react';
import { Recycle } from '@/components/icons';
import DragModal from '@/components/modal/DragModal';
import ProTable from '@/components/ProTable';
import type { UserModel } from '@/services/system/user/type';
import { userService } from '@/services/system/user/userApi';
import type { UserSearchParams } from '../../types';
import SearchForm from './SearchForm';
import TableToolbar from './TableToolbar';
import { useRecycleActions } from './useRecycleActions';
import { useTableColumns } from './useTableColumns';

/**
 * 回收站弹窗属性
 */
interface RecycleModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
}

/**
 * 回收站弹窗组件
 */
const RecycleModal: React.FC<RecycleModalProps> = ({ open, onCancel, onOk }) => {
  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 表格数据总数
  const [total, setTotal] = useState<number>(0);
  // 查询参数
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 查询回收站数据
  const {
    isFetching,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_user_recycle', searchParams],
    queryFn: () => userService.queryRecycleUserListPage(searchParams),
    enabled: open,
  });

  // 回收站操作
  const { handleRestore, handleBatchRestore, restoring } = useRecycleActions(() => {
    setSelectedRowKeys([]);
    refetch();
  });

  // 同步分页总数
  useEffect(() => {
    if (result?.totalRow !== undefined) {
      setTotal(result.totalRow);
    }
  }, [result?.totalRow]);

  // 获取表格列配置
  const columns = useTableColumns({ onRestore: handleRestore });

  // 处理搜索
  const handleSearch = (values: UserSearchParams) => {
    const search = {
      ...values,
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize,
    };
    // 判断参数是否发生变化
    if (isEqual(search, searchParams)) {
      // 参数没有变化，手动刷新数据
      refetch();
      return;
    }
    setSearchParams((prev: UserSearchParams) => ({ ...prev, ...search, pageNum: 1 }));
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // 处理行选择变化
  const handleSelectionChange = (keys: Key[], _rows: UserModel[]) => {
    setSelectedRowKeys(keys as string[]);
  };

  // 批量恢复
  const handleBatchRestoreClick = () => {
    handleBatchRestore(selectedRowKeys);
  };

  // 弹窗关闭时重置状态
  useEffect(() => {
    if (!open) {
      setSelectedRowKeys([]);
      setSearchParams({
        pageNum: 1,
        pageSize: 20,
      });
    }
  }, [open]);

  return (
    <DragModal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-3">
          <Recycle className="block! text-green-500!" />
          回收站
        </div>
      }
      width={1200}
      maskClosable={false}
      footer={
        <Space>
          <Button type="primary" onClick={onOk}>
            关闭
          </Button>
        </Space>
      }
      styles={{
        body: {
          padding: '16px',
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
        },
      }}
    >
      <div className="flex flex-col gap-4 h-full">
        {/* 搜索区域 */}
        <SearchForm onSearch={handleSearch} loading={isFetching} />

        {/* 表格区域 */}
        <ProTable<UserModel>
          title="回收站用户列表"
          columns={columns}
          dataSource={result?.records || []}
          loading={isFetching}
          rowKey="id"
          onRefresh={refetch}
          cardVariant="outlined"
          actionButtons={
            <TableToolbar
              selectedCount={selectedRowKeys.length}
              onBatchRestore={handleBatchRestoreClick}
              restoring={restoring}
            />
          }
          rowSelection={{
            type: 'checkbox' as const,
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          pagination={{
            current: searchParams.pageNum,
            pageSize: searchParams.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => `${range[0]} - ${range[1]} / ${total} 条`,
            hideOnSinglePage: false,
            onChange: handlePageChange,
          }}
          scroll={{ x: '100%', y: '300px' }}
          bordered
          cardClassNames={{
            root: 'grow min-h-0 flex flex-col',
            body: 'flex grow',
            table: {
              container: 'grow min-h-0 min-w-0',
            },
          }}
        />
      </div>
    </DragModal>
  );
};

export default RecycleModal;

import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';
import ProTable from '@/components/ProTable';
import { dictService } from '@/services/system/dict/dictApi';
import type { DictModel, DictType } from '@/services/system/dict/type.d';
import DictInfoModal from './components/DictInfoModal';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { useDictActions } from './hooks/useDictAction';
import { useDictModals } from './hooks/useDictModals';
import { useDictTableColumns } from './hooks/useDictTableColumn';
import type { DictSearchParams } from './types';

/**
 * 数据字典管理页：上检索 + 下表格，编辑维护用弹窗（可切换数据元类型展示不同配置）
 */
const Dict: React.FC = () => {
  const { modal: modalName, current, closeModal, openModal } = useDictModals();
  const [searchParams, setSearchParams] = useState<DictSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });
  const [total, setTotal] = useState<number>(0);

  const {
    data: result,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['sys_dict', searchParams],
    queryFn: () =>
      dictService.queryDictListPage({
        ...searchParams,
        dictType: searchParams.dictType as DictType | undefined,
        total: searchParams.pageNum === 1 ? 0 : total,
      }),
  });

  useEffect(() => {
    if (searchParams.pageNum === 1 && result?.totalRow != null) {
      setTotal(result.totalRow);
    }
  }, [searchParams.pageNum, result?.totalRow]);

  const handleSuccess = () => {
    closeModal();
    refetch();
  };

  const { handleModalSave } = useDictActions({ currentRow: current, onSuccess: handleSuccess });

  const handleSearch = (values: DictSearchParams) => {
    const next = { ...searchParams, ...values };
    if (isEqual(next, searchParams)) {
      refetch();
      return;
    }
    setSearchParams((prev) => ({ ...prev, ...values }));
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize ?? prev.pageSize,
    }));
  };

  const columns = useDictTableColumns({
    currentRow: current,
    openModal,
    onSuccess: handleSuccess,
  });

  const modalAction: 'add' | 'edit' | 'view' = modalName === 'add' ? 'add' : modalName === 'view' ? 'view' : 'edit';

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        <SearchForm onSearch={handleSearch} loading={isFetching} />
        <ProTable<DictModel>
          title="字典列表"
          columns={columns}
          dataSource={result?.records ?? []}
          loading={isFetching}
          rowKey="id"
          actionButtons={<TableActionButtons openModal={openModal} refetch={refetch} />}
          onRefresh={refetch}
          pagination={{
            current: searchParams.pageNum,
            pageSize: searchParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t: number, range: [number, number]) => `${range[0]} - ${range[1]} / ${t} 条`,
            hideOnSinglePage: false,
            onChange: handlePageChange,
          }}
          bordered
          cardClassNames={{
            root: 'grow min-h-0 flex flex-col',
            body: 'flex grow',
            table: {
              container: 'grow min-h-0 min-w-0',
              root: 'full-height-table',
            },
          }}
        />
      </div>
      <DictInfoModal
        open={modalName === 'add' || modalName === 'edit' || modalName === 'view'}
        action={modalAction}
        dictInfo={current ?? null}
        onOk={(payload) => handleModalSave(payload)}
        onCancel={closeModal}
      />
    </>
  );
};

export default Dict;

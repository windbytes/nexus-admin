import useParentSize from '@/hooks/useParentSize';
import type { DictSearchParams, DictState } from '@/services/system/dict/type';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Card, type TableProps } from 'antd';
import { isEqual } from 'lodash-es';
import { useReducer, useState } from 'react';
import DictTable from './DictTable';
import getDictTableColumns from './DictTableColumn';
import DictSearchForm from './SearchForm';
import TableActionButtons from './TableActionButtons';

// 数据字典模块
const Dict: React.FC = () => {
  const { modal, message } = App.useApp();
  // 容器高度计算（表格）
  const { parentRef, height } = useParentSize();

  // 定义状态
  const [state, dispatch] = useReducer(
    (prev: DictState, action: Partial<DictState>) => ({
      ...prev,
      ...action,
    }),
    {
      // 编辑窗口的打开状态
      openEditModal: false,
      // 当前编辑的行数据
      editRow: null,
      // 当前选中的行数据
      selectRow: [],
      // 当前操作
      action: '',
    }
  );

  // 查询参数（包含分页参数）
  const [searchParams, setSearchParams] = useState<DictSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 查询字典数据
  const {
    isLoading,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_dict', searchParams],
    queryFn: () => {},
  });

  // 处理搜索
  const handleSearch = (values: DictSearchParams) => {
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
    setSearchParams((prev) => ({ ...prev, ...search }));
  };

  // 处理逻辑删除角色
  const logicDeleteUserMutation = useMutation({
    mutationFn: (ids: string[]) => {
      return Promise.resolve(true);
    },
    onSuccess() {
      message.success('删除成功!');
      dispatch({
        selectRow: [],
      });
      refetch();
    },
    onError(error) {
      modal.error({
        title: '操作失败',
        content: `原因：${error}`,
      });
    },
  });

  /**
   * 获取表格列配置
   */
  const columns = getDictTableColumns({
    dispatch,
    logicDeleteUserMutation,
  });

  /**
   * 多行选中的配置
   */
  const rowSelection: TableProps['rowSelection'] = {
    // 行选中的回调
    onChange(_selectedRowKeys, selectedRows: any[]) {
      dispatch({
        selectRow: [...selectedRows],
      });
    },
    columnWidth: 32,
    fixed: true,
  };

  /**
   * 表格行双击显示预览
   */
  const onRow = (record: any) => {
    return {
      onDoubleClick: () => {
        dispatch({
          openEditModal: true,
          editRow: record,
          action: 'view',
        });
      },
    };
  };

  // 处理新增
  const handleAdd = () => {};

  // 处理批量删除
  const handleBatchDelete = () => {};

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        {/* 搜索表单 */}
        <DictSearchForm onSearch={handleSearch} />
        {/* 查询表格 */}
        <Card style={{ flex: 1, marginTop: '8px', minHeight: 0 }} styles={{ body: { height: '100%' } }} ref={parentRef}>
          {/* 操作按钮 */}
          <TableActionButtons
            handleAdd={handleAdd}
            handleBatchDelete={handleBatchDelete}
            refetch={refetch}
            selectedRows={[]}
          />

          {/* 表格数据 */}
          <DictTable
            tableData={result?.data || []}
            loading={isLoading}
            columns={columns}
            onRow={onRow}
            rowSelection={rowSelection}
            height={height}
            pagination={{
              pageSize: searchParams.pageSize,
              current: searchParams.pageNum,
              showQuickJumper: true,
              hideOnSinglePage: false,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              total: result?.total || 0,
              onChange(page, pageSize) {
                setSearchParams({
                  ...searchParams,
                  pageNum: page,
                  pageSize: pageSize,
                });
              },
            }}
          />
        </Card>
      </div>
    </>
  );
};
export default Dict;

import { useQuery } from '@tanstack/react-query';
import { Pagination, Select, Space, Tag, Typography } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { permissionService } from '@/services/system/permission/permissionApi';
import type { PermissionModel } from '@/services/system/permission/type';
import './PermissionCodeSelector.scss';
import type { PermissionCodeSelectorProps } from './types';

const DEFAULT_PAGE_SIZE = 10;

/**
 * 权限编码选择器：基于 Select 组件实现，支持搜索和分页
 * 数据由 React Query 管理，支持缓存
 */
const PermissionCodeSelector: React.FC<PermissionCodeSelectorProps> = ({
  value,
  onChange,
  resourceType,
  placeholder = '请选择或输入权限编码',
  disabled = false,
  allowClear = true,
  pageSize = DEFAULT_PAGE_SIZE,
}) => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  // 数据总数（首页返回，翻页时传给后端）
  const [total, setTotal] = useState<number>(0);

  const { data, isFetching } = useQuery({
    queryKey: ['permission_selector', resourceType, currentPage, pageSize, searchKeyword],
    queryFn: () =>
      permissionService.queryPermissionListPage({
        resourceType,
        pageNum: currentPage,
        pageSize,
        permCode: searchKeyword || undefined,
        permName: searchKeyword || undefined,
        total: currentPage === 1 ? 0 : total,
      }),
    enabled: open,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const list = data?.records ?? [];

  // 同步分页总数（仅首页返回的总数用于后续翻页传参）
  useEffect(() => {
    if (currentPage === 1 && data?.totalRow !== undefined) {
      setTotal(data.totalRow);
    }
  }, [currentPage, data?.totalRow]);

  const handleDropdownVisibleChange = (visible: boolean) => {
    setOpen(visible);
    if (visible) {
      setCurrentPage(1);
      setSearchKeyword('');
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleChange = (selectedValue: string | undefined) => {
    onChange?.(selectedValue);
  };

  return (
    <Select
      className="permissionCodeSelector"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      showSearch={{
        filterOption: false,
        onSearch: handleSearch,
      }}
      open={open}
      onOpenChange={handleDropdownVisibleChange}
      loading={isFetching}
      notFoundContent={isFetching ? '加载中...' : '暂无数据'}
      style={{ width: '100%' }}
      classNames={{
        popup: {
          root: 'permissionCodeSelectorDropdown',
        },
      }}
      options={list.map((item) => ({
        value: item.permCode,
        label: item.permCode,
        item,
      }))}
      optionRender={(option) => {
        const item = (option.data as { item: PermissionModel }).item;
        return (
          <Space orientation="vertical" size={2} style={{ width: '100%', padding: '4px 0' }}>
            <Space size={8}>
              <Typography.Text strong style={{ minWidth: 100 }}>
                {item.permCode}
              </Typography.Text>
              <Tag color={item.status ? 'success' : 'error'}>{item.status ? '启用' : '停用'}</Tag>
            </Space>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {item.permName}
            </Typography.Text>
          </Space>
        );
      }}
      popupRender={(menu) => (
        <div>
          {menu}
          {total > 0 && (
            <div className="paginationSection">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                size="small"
                showSizeChanger={false}
                showQuickJumper
                onChange={handlePageChange}
                showTotal={(totalNum) => `共 ${totalNum} 条`}
              />
            </div>
          )}
        </div>
      )}
    />
  );
};

export default PermissionCodeSelector;

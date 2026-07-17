/**
 * @file 权限编码下拉选择器
 * @description 按 resourceType 分页检索权限点，供按钮/接口表单选择 permCode。
 */

import { useQuery } from '@tanstack/react-query';
import { Pagination, Select, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { permissionService } from '@/modules/system/api/permission';
import type { PermissionModel } from '@/shared/api/system/permission/type';
import type { PermissionCodeSelectorProps } from './types';
import './PermissionCodeSelector.css';

const DEFAULT_PAGE_SIZE = 10;

/**
 * 权限编码选择器：Select + 远程分页搜索。
 *
 * @param props - 资源类型、受控 value/onChange 等
 */
function PermissionCodeSelector({
  value,
  onChange,
  resourceType,
  placeholder = '请选择或输入权限编码',
  disabled = false,
  allowClear = true,
  pageSize = DEFAULT_PAGE_SIZE,
}: PermissionCodeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    if (currentPage === 1 && data?.totalRow !== undefined) {
      setTotal(data.totalRow);
    }
  }, [currentPage, data?.totalRow]);

  /**
   * @param visible - 下拉是否展开
   */
  function handleDropdownVisibleChange(visible: boolean) {
    setOpen(visible);
    if (visible) {
      setCurrentPage(1);
      setSearchKeyword('');
    }
  }

  /**
   * @param keyword - 搜索关键字
   */
  function handleSearch(keyword: string) {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  }

  /**
   * @param page - 目标页码
   */
  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  /**
   * @param selectedValue - 选中的权限编码
   */
  function handleChange(selectedValue: string | undefined) {
    onChange?.(selectedValue);
  }

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
}

export default PermissionCodeSelector;

import { useQuery } from '@tanstack/react-query';
import { Input, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { permissionService } from '@/services/system/permission/permissionApi';
import type { PermissionModel } from '@/services/system/permission/type';
import cn from '@/utils/classnames';
import './PermissionCodeSelector.scss';
import type { PermissionCodeSelectorProps } from './types';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_DROPDOWN_WIDTH = 420;
const DEFAULT_DROPDOWN_HEIGHT = 360;

/**
 * 权限编码选择器：输入框 + 下拉分页表格，按资源类型查询权限点，选中行将权限编码填入输入框
 * 数据仅在首次打开下拉时请求，之后由 React Query 缓存；翻页会按页缓存。
 */
const PermissionCodeSelector: React.FC<PermissionCodeSelectorProps> = ({
  value,
  onChange,
  resourceType,
  placeholder = '请选择或输入权限编码',
  disabled = false,
  allowClear = true,
  maxLength = 32,
  dropdownWidth = DEFAULT_DROPDOWN_WIDTH,
  dropdownHeight = DEFAULT_DROPDOWN_HEIGHT,
  pageSize = DEFAULT_PAGE_SIZE,
}) => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useQuery({
    queryKey: ['permission_selector', resourceType, currentPage, pageSize],
    queryFn: () =>
      permissionService.queryPermissionListPage({
        resourceType,
        pageNum: currentPage,
        pageSize,
      }),
    enabled: open,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const list = data?.records ?? [];
  const total = data?.totalRow ?? 0;

  useEffect(() => {
    if (open) {
      setCurrentPage(1);
    }
  }, [open]);

  const handleInputFocus = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      const relatedTarget = e.relatedTarget as Element | null;
      if (
        relatedTarget &&
        (containerRef.current?.contains(relatedTarget) ?? dropdownRef.current?.contains(relatedTarget))
      ) {
        return;
      }
      setOpen(false);
    }, 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value?.trim() || undefined;
    onChange?.(v);
  };

  const handleRowClick = (record: PermissionModel) => {
    onChange?.(record.permCode);
    setOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [open]);

  const columns: ColumnsType<PermissionModel> = [
    { title: '权限编码', dataIndex: 'permCode', key: 'permCode', ellipsis: true, width: 140 },
    { title: '权限名称', dataIndex: 'permName', key: 'permName', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 72,
      render: (status: boolean) => <Tag color={status ? 'success' : 'error'}>{status ? '启用' : '停用'}</Tag>,
    },
  ];

  const tableHeight = dropdownHeight - 56;

  return (
    <div ref={containerRef} className="permissionCodeSelector">
      <Input
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        maxLength={maxLength}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        suffix={<span className={cn('suffixIcon', open && 'open')}>▼</span>}
      />
      {open && (
        <div
          ref={dropdownRef}
          className="dropdown"
          style={{ width: Math.max(dropdownWidth, containerRef.current?.offsetWidth ?? 0), maxHeight: dropdownHeight }}
        >
          <div className="tableSection">
            <Table<PermissionModel>
              bordered
              size="small"
              rowKey="id"
              columns={columns}
              dataSource={list}
              loading={isFetching}
              scroll={{ y: tableHeight }}
              pagination={{
                current: currentPage,
                pageSize,
                total,
                showSizeChanger: false,
                showQuickJumper: true,
                onChange: handlePageChange,
              }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                className: cn(value === record.permCode && 'rowSelected'),
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionCodeSelector;

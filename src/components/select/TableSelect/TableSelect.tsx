import { Input, Table } from 'antd';
import type React from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import cn from '@/utils/classnames';
import type { TableSelectProps, TableSelectState } from './types';
import styles from './TableSelect.module.scss';

/**
 * 表格选择器组件
 */
const TableSelect = <T extends Record<string, any> = any>({
  id,
  placeholder,
  disabled = false,
  allowClear = true,
  styles: customStyles,
  classNames,
  dropdownWidth = 400,
  dropdownHeight = 300,
  pagination = false,
  displayField,
  keyField,
  dataSource,
  value,
  onChange,
  onSelect,
  onSearch,
  renderDisplayValue: _renderDisplayValue,
  displayValueFormatter,
  customFilter,
}: TableSelectProps<T>) => {
  const [state, setState] = useState<TableSelectState<T>>({
    open: false,
    searchValue: '',
    filteredData: [],
    selectedRowIndex: -1,
    loading: false,
    rawData: [],
    columns: [],
  });

  const inputRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 加载数据
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await dataSource(id);
      setState(prev => ({
        ...prev,
        rawData: result.data,
        filteredData: result.data,
        columns: result.columns,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [dataSource, id]);

  // 过滤数据
  const filterData = useCallback((searchValue: string) => {
    if (!searchValue.trim()) {
      setState(prev => ({ ...prev, filteredData: prev.rawData }));
      return;
    }

    const fields = state.columns
      .filter(col => col.searchable !== false)
      .map(col => col.dataIndex);

    const filtered = state.rawData.filter(record => {
      if (customFilter) {
        return customFilter(record, searchValue);
      }

      return fields.some(field => {
        const value = record[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchValue.toLowerCase());
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchValue);
        }
        return false;
      });
    });

    setState(prev => ({
      ...prev,
      filteredData: filtered,
      selectedRowIndex: filtered.length > 0 ? 0 : -1,
    }));
  }, [state.rawData, state.columns, customFilter]);

  // 处理搜索
  const handleSearch = useCallback((searchValue: string) => {
    setState(prev => ({ ...prev, searchValue }));
    filterData(searchValue);
    onSearch?.(searchValue);
  }, [filterData, onSearch]);

  // 处理选择
  const handleSelect = useCallback((record: T, type: 'click' | 'keyboard' = 'click') => {
    onChange?.(record);
    setState(prev => ({ 
      ...prev, 
      open: false,
      searchValue: '', // 选择后清空搜索值，让输入框显示选中项的值
      selectedRowIndex: -1, // 重置选中行索引
    }));
    onSelect?.(record, [record], { type });
  }, [onChange, onSelect]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!state.open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setState(prev => ({ ...prev, open: true }));
        if (state.rawData.length === 0) {
          loadData();
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setState(prev => ({
          ...prev,
          selectedRowIndex: Math.min(prev.selectedRowIndex + 1, prev.filteredData.length - 1),
        }));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setState(prev => ({
          ...prev,
          selectedRowIndex: Math.max(prev.selectedRowIndex - 1, 0),
        }));
        break;
      case 'Enter':
        e.preventDefault();
        if (state.selectedRowIndex >= 0 && state.filteredData[state.selectedRowIndex]) {
          handleSelect(state.filteredData[state.selectedRowIndex], 'keyboard');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setState(prev => ({ ...prev, open: false }));
        break;
    }
  }, [state.open, state.selectedRowIndex, state.filteredData, state.rawData.length, loadData, handleSelect]);

  // 处理输入框点击
  const handleInputClick = useCallback(() => {
    if (!state.open) {
      setState(prev => ({ ...prev, open: true }));
      if (state.rawData.length === 0) {
        loadData();
      }
    }
  }, [state.open, state.rawData.length, loadData]);

  // 处理输入框聚焦
  const handleInputFocus = useCallback(() => {
    if (!state.open) {
      setState(prev => ({ ...prev, open: true }));
      if (state.rawData.length === 0) {
        loadData();
      }
    }
  }, [state.open, state.rawData.length, loadData]);

  // 处理输入框失焦
  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // 延迟检查，确保能够捕获到相关元素的焦点
    setTimeout(() => {
      const relatedTarget = e.relatedTarget as Element | null;
      
      // 如果焦点转移到了组件内部的元素（下拉层、表格、翻页等），不关闭下拉层
      if (relatedTarget && dropdownRef.current?.contains(relatedTarget)) {
        return;
      }
      
      // 如果焦点转移到了组件外部的元素，关闭下拉层
      setState(prev => ({ ...prev, open: false }));
    }, 100); // 适中的延迟时间
  }, []);

  // 处理输入框清空
  const handleInputClear = useCallback(() => {
    onChange?.(undefined);
    setState(prev => ({
      ...prev,
      searchValue: '',
      selectedRowIndex: -1,
    }));
    filterData('');
  }, [onChange, filterData]);

  // 处理输入框值变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 如果用户开始输入，清空当前选中的值
    if (inputValue && value) {
      onChange?.(undefined);
    }
    
    handleSearch(inputValue);
    
    // 如果输入框有值，打开下拉层
    if (inputValue && !state.open) {
      setState(prev => ({ ...prev, open: true }));
      if (state.rawData.length === 0) {
        loadData();
      }
    }
    
    // 如果输入框为空，重置选中行索引
    if (!inputValue) {
      setState(prev => ({ ...prev, selectedRowIndex: -1 }));
    }
  }, [handleSearch, state.open, state.rawData.length, loadData, value, onChange]);

  // 处理表格行点击
  const handleRowClick = useCallback((record: T) => {
    handleSelect(record, 'click');
  }, [handleSelect]);

  // 获取显示值（输入框只接受字符串）
  const displayValue = useMemo(() => {
    if (value) {
      // 有选中值时，显示选中项的值（始终返回字符串）
      if (displayValueFormatter) {
        return displayValueFormatter(value);
      }
      return value[displayField] || '';
    } else {
      // 没有选中值时，显示搜索值
      return state.searchValue;
    }
  }, [value, displayField, displayValueFormatter, state.searchValue]);

  // 表格行选择配置
  const rowSelection = useMemo(() => ({
    type: 'radio' as const,
    selectedRowKeys: value ? [value[keyField]] : [],
    onChange: (_selectedRowKeys: React.Key[], selectedRows: T[]) => {
      if (selectedRows.length > 0) {
        handleSelect(selectedRows[0], 'click');
      }
    },
  }), [value, keyField, handleSelect]);

  // 表格列配置
  const tableColumns = useMemo(() => {
    return state.columns.map(col => ({
      ...col,
      ellipsis: true,
      width: col.width || 120,
    }));
  }, [state.columns]);

  // 表格行样式
  const getRowClassName = useCallback((record: T, index: number) => {
    const isSelected = state.selectedRowIndex === index;
    const isCurrentValue = value && record[keyField] === value[keyField];
    
    return cn(
      isSelected && styles.selected,
      isCurrentValue && styles.currentValue,
    );
  }, [state.selectedRowIndex, value, keyField]);

  // 监听全局点击事件，处理点击外部关闭下拉层
  useEffect(() => {
    if (!state.open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // 检查点击是否在组件内部
      if (
        dropdownRef.current?.contains(target) ||
        inputRef.current?.nativeElement.contains(target)
      ) {
        return;
      }
      
      // 点击在组件外部，关闭下拉层
      setState(prev => ({ ...prev, open: false }));
    };

    // 添加事件监听器，使用 capture 阶段确保能够捕获到事件
    document.addEventListener('mousedown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [state.open]);

  // 键盘导航时滚动到选中行
  useEffect(() => {
    if (state.selectedRowIndex >= 0 && dropdownRef.current) {
      // 使用 setTimeout 确保 DOM 已经更新
      const timer = setTimeout(() => {
        try {
          // 使用 dropdownRef 来查找表格内容，因为 tableRef 可能不直接暴露 DOM 元素
          const tableBody = dropdownRef.current?.querySelector('.ant-table-tbody');
          if (tableBody) {
            const rows = tableBody.querySelectorAll('tr');
            const selectedRow = rows[state.selectedRowIndex];
            if (selectedRow) {
              // 使用 block: 'center' 确保选中行在视口中央，并增加额外的滚动选项
              selectedRow.scrollIntoView({ 
                block: 'center',
                inline: 'nearest',
                behavior: 'smooth'
              });
              
              // 如果滚动到最底部，确保完全可见
              const tableContainer = dropdownRef.current?.querySelector('.ant-table-body');
              if (tableContainer) {
                const containerRect = tableContainer.getBoundingClientRect();
                const rowRect = selectedRow.getBoundingClientRect();
                
                // 如果选中行在容器底部附近，额外滚动一点确保完全可见
                if (rowRect.bottom > containerRect.bottom - 10) {
                  tableContainer.scrollTop += 20;
                }
              }
            }
          }
        } catch (error) {
          console.warn('Failed to scroll to selected row:', error);
        }
      }, 50); // 增加延迟时间确保表格渲染完成

      return () => clearTimeout(timer);
    }
  }, [state.selectedRowIndex]);

  // 下拉层内容
  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={cn(
        styles.dropdown,
        classNames?.dropdown,
      )}
      style={{
        width: dropdownWidth,
        maxHeight: dropdownHeight,
        ...customStyles?.dropdown,
      }}
    >
      <div className={styles.tableSection}>
        <Table<T>
          bordered
          columns={tableColumns}
          dataSource={state.filteredData}
          rowKey={keyField}
          size="small"
          pagination={pagination}
          rowSelection={rowSelection}
          rowClassName={getRowClassName}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          scroll={{ y: dropdownHeight - (pagination ? 100 : 48), x: 'max-content' }}
          className={cn(styles.table, classNames?.table)}
          loading={state.loading}
          style={customStyles?.table}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.tableSelect}>
      <Input
        ref={inputRef}
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        style={customStyles?.input}
        className={cn(styles.input, classNames?.input)}
        onKeyDown={handleKeyDown}
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onClear={handleInputClear}
        onChange={handleInputChange}
        suffix={
          <span className={cn(styles.suffixIcon, state.open && styles.open)}>
            ▼
          </span>
        }
      />
      
      {state.open && dropdownContent}
    </div>
  );
};

export default TableSelect;
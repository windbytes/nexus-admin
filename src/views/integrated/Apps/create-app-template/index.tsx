import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import type React from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import CategorySidebar from './components/CategorySidebar';
import TemplateGrid from './components/TemplateGrid';
import TemplateHeaders from './Headers';
import { templateService } from './services';
import './styles.css';
import type { AppTemplate, TemplateSearchParams, TemplateType } from './types';

/**
 * 应用模板创建弹窗
 */
const AppTemplates: React.FC<AppsTemplateModelProps> = ({ open, onClose, onCreateFromBlank }) => {
  const { message } = App.useApp();
  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState('recommended');
  const [selectedTypes, setSelectedTypes] = useState<TemplateType[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 获取分类数据
  const { data: categories = [] } = useQuery({
    queryKey: ['template_categories'],
    queryFn: templateService.getCategories,
  });

  // 获取筛选选项
  const { data: filterOptions = [] } = useQuery({
    queryKey: ['template_filter_options'],
    queryFn: templateService.getFilterOptions,
  });

  // 搜索模板
  const { data: searchResult, isFetching: searchLoading } = useQuery({
    queryKey: ['template_search', searchParams],
    queryFn: () => templateService.searchTemplates(searchParams),
    enabled: !!searchParams,
  });

  // 根据分类获取模板
  const { data: categoryTemplates = [], isFetching: categoryLoading } = useQuery({
    queryKey: ['template_category', selectedCategory],
    queryFn: () => templateService.getTemplatesByCategory(selectedCategory),
    enabled: selectedCategory !== 'recommended',
  });

  // 当前显示的模板
  const currentTemplates = useMemo(() => {
    if (selectedCategory === 'recommended' || searchKeyword || selectedTypes.length > 0) {
      return searchResult?.list || [];
    }
    return categoryTemplates;
  }, [selectedCategory, searchResult?.list, categoryTemplates, searchKeyword, selectedTypes]);

  // 当前加载状态
  const isLoading = searchLoading || categoryLoading;

  // 处理分类选择
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchParams({
      pageNum: 1,
      pageSize: 20,
      category: categoryId === 'recommended' ? '' : categoryId,
    });
    setSearchKeyword('');
    setSelectedTypes([]);
  }, []);

  // 处理类型筛选变化
  const handleTypeChange = useCallback((types: TemplateType[]) => {
    setSelectedTypes(types);
    setSearchParams((prev) => ({
      ...prev,
      types: types.length > 0 ? types : [],
      pageNum: 1,
    }));
  }, []);

  // 处理搜索
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setSearchParams((prev) => ({
      ...prev,
      keyword: keyword || '',
      pageNum: 1,
    }));
  }, []);

  // 处理模板选择
  const handleTemplateSelect = useCallback((template: AppTemplate) => {
    message.success(`已选择模板: ${template.name}`);
    // 这里可以添加跳转到模板详情或创建应用的逻辑
    console.log('选择的模板:', template);
  }, []);

  // 处理创建空白应用
  const handleCreateBlank = useCallback(() => {
    onCreateFromBlank();
    onClose();
  }, [onCreateFromBlank, onClose]);

  return (
    <DragModal
      footer={null}
      centered
      style={{ height: '90vh' }}
      styles={{ body: { height: 'calc(90vh - 92px)', overflowY: 'auto' } }}
      width="80%"
      open={open}
      title={
        <TemplateHeaders
          searchKeyword={searchKeyword}
          selectedTypes={selectedTypes}
          filterOptions={filterOptions}
          onSearch={handleSearch}
          onTypeChange={handleTypeChange}
        />
      }
      onCancel={onClose}
    >
      <div className="relative flex h-full overflow-y-auto">
        {/* 左侧分类导航 */}
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onCreateBlank={handleCreateBlank}
        />

        {/* 右侧模板展示 */}
        <div className="h-full flex-1 shrink-0 grow overflow-auto px-6">
          <TemplateGrid templates={currentTemplates} loading={isLoading} onTemplateSelect={handleTemplateSelect} />
        </div>
      </div>
    </DragModal>
  );
};

export default memo(AppTemplates);

/**
 * 应用模板弹窗参数
 */
export interface AppsTemplateModelProps {
  open: boolean;
  onClose: () => void;
  onCreateFromBlank: () => void;
}

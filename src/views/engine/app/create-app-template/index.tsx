import { useMutation, useQuery } from '@tanstack/react-query';
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
const AppTemplates: React.FC<AppsTemplateModelProps> = ({
  open,
  onClose,
  onCreateFromBlank,
  onTemplateCreateSuccess,
}) => {
  const { message } = App.useApp();
  const createFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, appName }: { templateId: string; appName?: string }) =>
      templateService.createAppFromTemplate(templateId, appName),
    onSuccess: () => {
      message.success('已从模板创建应用');
      onTemplateCreateSuccess?.();
      onClose();
    },
    onError: (e) => {
      message.error((e as Error).message ?? '创建失败');
    },
  });
  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState('recommended');
  const [selectedTypes, setSelectedTypes] = useState<TemplateType[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 仅弹窗打开时请求，避免在列表页切换分段时重复拉取
  const { data: categories = [] } = useQuery({
    queryKey: ['template_categories'],
    queryFn: templateService.getCategories,
    enabled: open,
  });

  const { data: filterOptions = [] } = useQuery({
    queryKey: ['template_filter_options'],
    queryFn: templateService.getFilterOptions,
    enabled: open,
  });

  const { data: searchResult, isFetching: searchLoading } = useQuery({
    queryKey: ['template_search', searchParams],
    queryFn: () => templateService.searchTemplates(searchParams),
    enabled: open && !!searchParams,
  });

  const { data: categoryTemplates = [], isFetching: categoryLoading } = useQuery({
    queryKey: ['template_category', selectedCategory],
    queryFn: () => templateService.getTemplatesByCategory(selectedCategory),
    enabled: open && selectedCategory !== 'recommended',
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

  // 处理模板选择：从模板创建应用
  const handleTemplateSelect = useCallback(
    (template: AppTemplate) => {
      createFromTemplateMutation.mutate({ templateId: template.id, appName: template.name });
    },
    [createFromTemplateMutation]
  );

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
  /** 从模板创建应用成功后回调（如刷新列表） */
  onTemplateCreateSuccess?: () => void;
}

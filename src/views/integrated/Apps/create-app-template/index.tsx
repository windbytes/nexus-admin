import DragModal from '@/components/modal/DragModal';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App, Input, Space } from 'antd';
import type React from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import CategorySidebar from './components/CategorySidebar';
import TemplateGrid from './components/TemplateGrid';
import TemplateTypeDropdown from './components/TemplateTypeDropdown';
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
  const { data: searchResult, isLoading: searchLoading } = useQuery({
    queryKey: ['template_search', searchParams],
    queryFn: () => templateService.searchTemplates(searchParams),
    enabled: !!searchParams,
  });

  // 根据分类获取模板
  const { data: categoryTemplates = [], isLoading: categoryLoading } = useQuery({
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
      style={{ height: '95vh' }}
      styles={{ body: { height: 'calc(95vh - 92px)', overflowY: 'auto' } }}
      width="95%"
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
 * 弹窗头部组件
 */
const TemplateHeaders: React.FC<TemplateHeadersProps> = ({
  searchKeyword,
  selectedTypes,
  filterOptions,
  onTypeChange,
  onSearch,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="min-w-[180px] pl-5">
        <span className="text-lg font-medium">从应用模板创建</span>
      </div>
      <div className="flex-1 max-w-[548px] p-1.5 flex items-center">
        <Space.Compact>
          <Space.Addon>
            <TemplateTypeDropdown
              selectedTypes={selectedTypes}
              onTypeChange={onTypeChange}
              filterOptions={filterOptions}
            />
          </Space.Addon>
          <Input
            className="w-full h-10"
            size="large"
            placeholder="搜索所有模版..."
            prefix={<SearchOutlined className="text-gray-400" />}

            value={searchKeyword}
            onChange={(e) => onSearch(e.target.value)}
            onPressEnter={(e) => onSearch((e.target as any).value)}
          />
        </Space.Compact>
        
      </div>
      <div className="w-[180px] h-8" />
    </div>
  );
};

interface TemplateHeadersProps {
  searchKeyword: string;
  selectedTypes: TemplateType[];
  filterOptions: Array<{ label: string; value: TemplateType; count: number }>;
  onTypeChange: (types: TemplateType[]) => void;
  onSearch: (keyword: string) => void;
}

/**
 * 应用模板弹窗参数
 */
export interface AppsTemplateModelProps {
  open: boolean;
  onClose: () => void;
  onCreateFromBlank: () => void;
}

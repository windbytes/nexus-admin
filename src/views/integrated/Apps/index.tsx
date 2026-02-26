import { ApartmentOutlined, ApiOutlined, AppstoreOutlined, SearchOutlined, SolutionOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useDebounceFn } from 'ahooks';
import { Button, Checkbox, Input, type InputRef, Segmented, type SegmentedProps, Space, Spin } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TagManagementModal from '@/components/base/tag-management';
import TagFilter from '@/components/base/tag-management/TagFilter.tsx';
import { BubbleLoading } from '@/components/icons';
import { usePermission } from '@/hooks/usePermission';
import type { App, AppSearchParams } from '@/services/integrated/apps/app';
import { appsService } from '@/services/integrated/apps/appsApi';
import { useTagStore } from '@/stores/useTagStore.ts';
import CreateAppCard from '@/views/integrated/Apps/NewAppCard.tsx';
import AppCard from './AppCard';
import './apps.scss';
/**
 * 应用设计
 */
const Apps: React.FC = () => {
  const { t } = useTranslation();
  const { showTagManagementModal } = useTagStore();

  // 搜索框聚焦
  const searchRef = useRef<InputRef>(null);
  // 是否有新增权限
  const hasAddPermission = usePermission(['engine:apps:add']);

  // 分段控制器选项
  const segmentedOptions: SegmentedProps<number>['options'] = [
    {
      label: t('app.segment.all'),
      value: 0,
      icon: <AppstoreOutlined />,
    },
    {
      label: t('app.segment.integrated'),
      value: 1,
      icon: <ApartmentOutlined />,
    },
    {
      label: t('app.segment.interface'),
      value: 2,
      icon: <ApiOutlined />,
    },
    {
      label: t('app.segment.tripartite'),
      value: 3,
      icon: <SolutionOutlined />,
    },
  ];

  // 选中的标签
  const [tagFilterValue, setTagFilterValue] = useState<string[]>([]);

  // 查询参数（包含分页参数）
  const [searchParams, setSearchParams] = useState<AppSearchParams>({
    type: 0,
    pageNum: 1,
    pageSize: 20,
  });

  // 查询应用数据（isLoading = 首次加载且无缓存数据，避免与路由 Suspense 双重 Spin）
  const {
    data: result,
    refetch,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ['integrated_app', searchParams],
    queryFn: () => appsService.getApps(searchParams),
  });

  // 处理搜索
  const handleSearch = (value: string) => {
    const search = {
      name: value,
      type: searchParams.type ?? 0,
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize,
    };
    if (isEqual(search, searchParams)) {
      // 参数没有变化，手动刷新数据
      refetch();
      return;
    }
    setSearchParams((prev) => ({ ...prev, ...search, type: search.type ?? prev.type }));
  };

  useEffect(() => {
    // 延后聚焦到下一帧绘制后，避免首帧重绘加剧闪烁
    const id = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  /**
   * 分段控制器切换
   * @param value 值
   */
  const onSegmentedChange = (value: number) => {
    setSearchParams({
      ...searchParams,
      type: value,
    });
  };

  /**
   * 我的应用切换
   * @param value 值
   */
  const onCreatedChange = (value: boolean) => {
    setSearchParams({
      ...searchParams,
      isMine: value,
    });
  };

  /**
   * 处理标签过滤器更新
   */
  const { run: handleTagsUpdate } = useDebounceFn(
    () => {
      // 更新页面应用的检索
      setSearchParams((prev) => ({ ...prev, tags: tagFilterValue }));
    },
    { wait: 500 }
  );

  /**
   * 标签切换
   * @param value 标签值
   */
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value);
    handleTagsUpdate();
  };

  return (
    <>
      <div className="flex flex-col h-full pt-2 pr-4 pl-4">
        {/* 卡片列表和筛选框 */}
        <div className="mb-[8px]">
          <div className="w-[600px] my-4 mx-auto">
            {/* 检索 */}
            <Space.Compact style={{ width: '100%' }}>
              <Input
                size="large"
                ref={searchRef}
                placeholder={t('common.placeholder')}
                onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => handleSearch(e.currentTarget.value)}
              />
              <Button
                size="large"
                type="primary"
                style={{ width: '60px' }}
                icon={<SearchOutlined />}
                onClick={() => handleSearch(searchRef.current?.input?.value || '')}
              />
            </Space.Compact>
          </div>
          <div className="w-full flex justify-between items-center">
            <Segmented<number>
              options={segmentedOptions}
              onChange={onSegmentedChange}
              value={searchParams.type ?? (0 as number)}
            />
            <div>
              {/* 区分我创建的、标签页 */}
              <Checkbox onChange={(e) => onCreatedChange(e.target.checked)}>{t('app.createBy')}</Checkbox>
              {/* 标签过滤 */}
              <TagFilter type="app" value={tagFilterValue} onChange={handleTagsChange} />
            </div>
          </div>
        </div>
        {/* 应用列表：固定容器减少布局跳动，仅无数据时全屏 Spin，有数据时始终展示列表并在拉取中显示轻量 loading */}
        <div className="flex-1 min-h-[320px] overflow-x-hidden overflow-y-auto grid content-start grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 2k:grid-cols-6 gap-4 pt-2 grow relative">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Spin indicator={<BubbleLoading width={48} />} />
            </div>
          ) : (
            <>
              {hasAddPermission && <CreateAppCard refresh={refetch} />}
              {(result || []).map((item: App) => (
                <AppCard key={item.id} app={item} onRefresh={refetch} />
              ))}
            </>
          )}
          {!isLoading && isFetching && (
            <div className="absolute top-2 right-2 z-10">
              <Spin size="small" indicator={<BubbleLoading width={24} />} />
            </div>
          )}
        </div>
      </div>
      {/* 显示标签管理弹窗 */}
      {<TagManagementModal type="app" show={showTagManagementModal} />}
    </>
  );
};
export default Apps;

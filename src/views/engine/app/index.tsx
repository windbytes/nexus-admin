import { AppstoreOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDebounceFn } from 'ahooks';
import {
  App as AntdApp,
  Button,
  Checkbox,
  Dropdown,
  Input,
  type InputRef,
  type MenuProps,
  Segmented,
  type SegmentedProps,
  Select,
  Space,
  Spin,
} from 'antd';
import { isEqual } from 'lodash-es';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TagManagementModal from '@/components/base/tag-management';
import TagFilter from '@/components/base/tag-management/TagFilter.tsx';
import { BubbleLoading } from '@/components/icons';
import { usePermission } from '@/hooks/usePermission';
import type { AppQuery, EngineApp } from '@/services/engine/app/types';
import { useTagStore } from '@/stores/useTagStore.ts';
import AppCard from './AppCard';
import { AppCardModalProvider, useAppCardModals } from './hooks/useAppCardModals';
import CreateAppCard from './NewAppCard';
import './apps.scss';
import { appCategoryService, appService } from '@/services/engine';

const EditAppModal = lazy(() => import('./edit-app-modal'));
const DuplicateAppModal = lazy(() => import('./duplicate-modal'));
const SaveAsTemplateModal = lazy(() => import('./save-as-template-modal'));

/** 分段中默认展示的分类数量，其余放入「更多」下拉 */
const CATEGORY_VISIBLE_COUNT = 8;

/**
 * 应用设计
 */
const Apps: React.FC = () => {
  const { t } = useTranslation();
  const { message, modal } = AntdApp.useApp();
  const { showTagManagementModal } = useTagStore();

  // 搜索框聚焦
  const searchRef = useRef<InputRef>(null);
  // 是否有新增权限
  const hasAddPermission = usePermission(['engine:apps:add']);

  // 选中的标签
  const [tagFilterValue, setTagFilterValue] = useState<string[]>([]);
  // 查询参数（分页等，categoryId 默认 '0' 表示全部，其余为分类 ID 字符串）
  const [searchParams, setSearchParams] = useState<AppQuery>({
    categoryId: '0',
    pageNum: 1,
    pageSize: 20,
  });

  // 应用分类列表：仅主页面首次挂载时请求一次，不随后续状态变更或焦点变化而重查（通过关闭各类 refetch 实现，不依赖 staleTime）
  const { data: categories = [] } = useQuery({
    queryKey: ['app_categories'],
    queryFn: () => appCategoryService.getAppCategories(),
  });

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    [categories]
  );

  // 分段选项：全部（第一个且默认选中）+ 前 N 个分类
  const segmentedOptions: SegmentedProps<string>['options'] = useMemo(
    () => [
      {
        label: t('app.segment.all'),
        value: '0',
        icon: <AppstoreOutlined />,
      },
      ...categoryOptions.slice(0, CATEGORY_VISIBLE_COUNT),
    ],
    [categoryOptions, t]
  );

  // 分段中出现的 categoryId 集合，用于决定 Segmented 的 value（选中「更多」中的分类时显示「全部」）
  const segmentValueSet = useMemo(
    () => new Set(['0', ...categoryOptions.slice(0, CATEGORY_VISIBLE_COUNT).map((o) => o.value)]),
    [categoryOptions]
  );

  // 「更多」下拉中的分类（第 9 个及之后）
  const restCategoryOptions = useMemo(() => categoryOptions.slice(CATEGORY_VISIBLE_COUNT), [categoryOptions]);

  // 当前选中的 categoryId（字符串，'0' 表示全部）
  const categoryId = searchParams.categoryId != null ? String(searchParams.categoryId) : '0';
  const selectedRestCategory = restCategoryOptions.find((o) => o.value === categoryId);
  const hasRestCategories = restCategoryOptions.length > 0;

  // 查询应用数据（isLoading = 首次加载且无缓存数据，避免与路由 Suspense 双重 Spin）
  const {
    data: result,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['integrated_app', searchParams],
    queryFn: () => appService.getApps(searchParams),
  });

  // 卡片弹窗统一状态（与 useUserModals 同模式，通过 Context 下发 openModal，避免回调导致卡片重渲染）
  const {
    modal: cardModalType,
    current: cardModalApp,
    openModal: openCardModal,
    closeModal: closeCardModal,
  } = useAppCardModals();

  const cardModalContextValue = useMemo(
    () => ({ openModal: openCardModal, closeModal: closeCardModal }),
    [openCardModal, closeCardModal]
  );

  const updateAppMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EngineApp> }) => appService.updateApp(id, payload),
    onSuccess: () => {
      message.success(t('app.updateApp.success'));
      refetch();
    },
    onError: (error) => {
      modal.error({
        title: t('app.updateApp.error.title'),
        content: t('app.updateApp.error.content', { error: (error as Error).message }),
      });
    },
  });

  const copyAppMutation = useMutation({
    mutationFn: (payload: Partial<EngineApp>) => appService.createApp(payload),
    onSuccess: () => {
      message.success(t('app.copyApp.success'));
      refetch();
    },
    onError: (error) => {
      modal.error({
        title: t('app.copyApp.error.title'),
        content: t('app.copyApp.error.content', { error: (error as Error).message }),
      });
    },
  });

  // 处理搜索
  const handleSearch = (value: string) => {
    const search = {
      name: value,
      categoryId: searchParams.categoryId ?? '0',
      status: searchParams.status,
      tags: searchParams.tags,
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize,
      isMine: searchParams.isMine,
    };
    if (isEqual(search, searchParams)) {
      refetch();
      return;
    }
    setSearchParams((prev) => ({ ...prev, ...search }));
  };

  useEffect(() => {
    // 延后聚焦到下一帧绘制后，避免首帧重绘加剧闪烁
    const id = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  /** 分段切换：仅处理「全部」与前 8 个分类 */
  const onSegmentedChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, categoryId: value }));
  };

  /** 「更多」下拉中选择分类 */
  const onDropdownCategorySelect: MenuProps['onClick'] = ({ key }) => {
    setSearchParams((prev) => ({ ...prev, categoryId: key }));
  };

  /** 「更多」下拉菜单项：全部 + 其余分类 */
  const moreDropdownItems: MenuProps['items'] = useMemo(
    () => [
      { key: '0', label: t('app.segment.all') },
      ...restCategoryOptions.map((o) => ({ key: o.value, label: o.label })),
    ],
    [restCategoryOptions, t]
  );

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

  /** 状态筛选：0-未启动 1-正常 2-异常 3-部分异常 */
  const onStatusChange = (value: number | undefined) => {
    setSearchParams((prev) => ({ ...prev, status: value }));
  };

  return (
    <AppCardModalProvider value={cardModalContextValue}>
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
            <div>
              <Segmented<string>
                options={segmentedOptions}
                onChange={onSegmentedChange}
                value={segmentValueSet.has(categoryId) ? categoryId : '0'}
              />
              {hasRestCategories && (
                <Dropdown menu={{ items: moreDropdownItems, onClick: onDropdownCategorySelect }} trigger={['click']}>
                  <Button type={selectedRestCategory ? 'primary' : 'default'} className="inline-flex items-center">
                    <Space size={6} className="text-[13px] font-medium leading-[18px]">
                      <AppstoreOutlined className="text-current shrink-0" />
                      <span className="truncate max-w-[120px]">
                        {selectedRestCategory ? selectedRestCategory.label : (t('app.segment.more') ?? '更多')}
                      </span>
                      <DownOutlined className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    </Space>
                  </Button>
                </Dropdown>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 状态筛选 */}
              <Select
                placeholder={t('app.statusFilter') ?? '状态'}
                allowClear
                style={{ width: 100 }}
                value={searchParams.status}
                onChange={onStatusChange}
                options={[
                  { label: t('app.status.all') ?? '全部', value: undefined },
                  { label: t('app.status.stopped') ?? '未启动', value: 0 },
                  { label: t('app.status.normal') ?? '正常', value: 1 },
                  { label: t('app.status.error') ?? '异常', value: 2 },
                  { label: t('app.status.partialError') ?? '部分异常', value: 3 },
                ]}
              />
              {/* 区分我创建的、标签页 */}
              <Checkbox onChange={(e) => onCreatedChange(e.target.checked)}>{t('app.createBy')}</Checkbox>
              {/* 标签过滤 */}
              <TagFilter type="app" value={tagFilterValue} onChange={handleTagsChange} />
            </div>
          </div>
        </div>
        {/* 应用列表：无数据且请求中时全屏 Spin，有数据时始终展示列表并在拉取中显示轻量 loading */}
        <div className="flex-1 min-h-[320px] overflow-x-hidden overflow-y-auto grid content-start grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 2k:grid-cols-6 gap-4 pt-2 grow relative">
          {isFetching ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Spin indicator={<BubbleLoading width={48} />} />
            </div>
          ) : (
            <>
              {hasAddPermission && <CreateAppCard refresh={refetch} />}
              {(result || []).map((item: EngineApp) => (
                <AppCard key={item.id} app={item} onRefresh={refetch} />
              ))}
            </>
          )}
        </div>
      </div>
      {/* 卡片操作弹窗：懒加载 + 单例，由 hook 状态驱动 */}
      <Suspense fallback={null}>
        {cardModalType === 'edit' && cardModalApp && (
          <EditAppModal
            open
            app={cardModalApp}
            onCancel={closeCardModal}
            onConfirm={async (payload) => {
              await updateAppMutation.mutateAsync({ id: cardModalApp.id, payload });
              closeCardModal();
            }}
          />
        )}
        {cardModalType === 'duplicate' && cardModalApp && (
          <DuplicateAppModal
            show
            appName={cardModalApp.name ?? ''}
            categoryId={cardModalApp.categoryId ?? null}
            icon_type={cardModalApp.icon_type ?? null}
            icon={cardModalApp.icon ?? ''}
            icon_url={cardModalApp.icon_url ?? null}
            icon_background={cardModalApp.iconBg ?? null}
            onCancel={closeCardModal}
            onConfirm={async (info) => {
              await copyAppMutation.mutateAsync({
                name: info.name,
                categoryId: info.categoryId ?? cardModalApp.categoryId ?? undefined,
                icon: info.icon ?? cardModalApp.icon,
                iconBg: info.icon_background ?? cardModalApp.iconBg ?? null,
                icon_type: info.icon_type ?? cardModalApp.icon_type ?? null,
                icon_url: info.icon_url ?? cardModalApp.icon_url ?? null,
                status: cardModalApp.status,
                priority: cardModalApp.priority,
                logLevel: cardModalApp.logLevel,
                remark: cardModalApp.remark,
              });
              closeCardModal();
            }}
          />
        )}
        {cardModalType === 'saveAsTemplate' && cardModalApp && (
          <SaveAsTemplateModal
            open
            app={cardModalApp}
            onCancel={closeCardModal}
            onSuccess={() => {
              refetch();
              closeCardModal();
            }}
          />
        )}
      </Suspense>

      {/* 显示标签管理弹窗 */}
      {<TagManagementModal type="app" show={showTagManagementModal} />}
    </AppCardModalProvider>
  );
};
export default Apps;

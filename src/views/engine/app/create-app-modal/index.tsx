import { ArrowRightOutlined, DownOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Button, Input, type InputRef, Select, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { memo, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';
import { usePlatformHotkey } from '@/hooks/usePlatformHotkey';
import type { AppCategory, EngineApp } from '@/services/engine/app/types';
import { appCategoryService } from '@/services/engine';
import { usePreferencesStore } from '@/stores/store';
import { getShortcutLabel } from '@/utils/utils';
import { useQuery } from '@tanstack/react-query';

/**
 * 添加项目弹窗
 * @returns
 */
const SHOW_FIRST_N = 4;

const AppInfoModal: React.FC<AppInfoModalProps> = ({ open, onOk, onCancel, onCreateFromTemplate }) => {
  const inputRef = useRef<InputRef>(null);
  const { data: categories = [] } = useQuery({
    queryKey: ['app_categories'],
    queryFn: () => appCategoryService.getAppCategories(),
    enabled: open,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number | null>(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [type, setType] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logLevel, setLogLevel] = useState<number>(1);
  const [priority, setPriority] = useState<number>(5);
  const [icon, setIcon] = useState<string>('');
  const [iconBg, setIconBg] = useState<string>('');
  const { t } = useTranslation();
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);

  const visibleCategories = useMemo(
    () => (showMoreCategories ? categories : categories.slice(0, SHOW_FIRST_N)),
    [categories, showMoreCategories]
  );
  const hasMoreCategories = categories.length > SHOW_FIRST_N;
  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(selectedCategoryId) || Number(c.id) === Number(selectedCategoryId)),
    [categories, selectedCategoryId]
  );

  // 绑定保存的快捷键
  const shotcut = usePlatformHotkey({
    mac: 'meta+s',
    windows: 'ctrl+s',
    handler: (event) => {
      event.preventDefault();
      if (name.trim().length > 0) {
        handleOk();
      }
    },
  });

  /**
   * 选择应用分类
   */
  const selectCategory = (cat: AppCategory) => {
    setSelectedCategoryId(cat.id);
    setType(1);
  };

  const handleAfterOpen = (open: boolean) => {
    if (open) {
      inputRef.current?.focus();
    }
  };

  /**
   * 点击确认的回调，payload 与 EngineApp 对齐。新建时状态固定为未启动(0)。
   */
  const handleOk = () => {
    const data: Partial<EngineApp> = {
      type,
      categoryId: selectedCategoryId != null ? String(selectedCategoryId) : undefined,
      name: name.trim(),
      remark: description.trim() || undefined,
      logLevel,
      status: 0,
      priority,
      icon: icon.trim() || undefined,
      iconBg: iconBg.trim() || undefined,
    };
    onOk(data);
  };

  return (
    <DragModal
      onCancel={onCancel}
      open={open}
      footer={null}
      centered
      style={{ height: '90vh' }} // 控制 Modal 外壳
      styles={{
        body: { height: 'calc(90vh - 50px)', overflowY: 'auto' },
      }}
      title="创建空白应用"
      width="75%"
      afterOpenChange={handleAfterOpen}
    >
      <div className="flex justify-center h-full overflow-y-auto overflow-x-hidden">
        {/* 左边显示 */}
        <div className="flex-1 shrink-0 flex justify-end">
          <div className="px-10">
            <div className="leading-6 mb-2">
              <span className="text-[#354052] text-[13px] font-semibold leading-4">选择应用分类</span>
            </div>
            <div className="flex flex-col w-[660px] gap-4">
              <div className="w-full">
                <div className="flex flex-row flex-wrap gap-2">
                  {visibleCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="w-[191px] h-[84px] p-3 border relative box-content! rounded-xl cursor-pointer shadow-xs hover:shadow-md"
                      style={{
                        borderColor:
                          String(selectedCategoryId) === String(cat.id) ? colorPrimary : '#e9ebf0',
                      }}
                      onClick={() => selectCategory(cat)}
                    >
                      <div className="w-6 h-6 bg-[#7839ee] rounded-md justify-center items-center flex">
                        <AppstoreOutlined className="w-4 h-4 text-[#ffffffe5]!" />
                      </div>
                      <div className="text-[#354052] mt-2 mb-0.5 text-[13px] font-semibold leading-4 truncate">
                        {cat.name}
                      </div>
                    </div>
                  ))}
                </div>
                {hasMoreCategories && (
                  <Button
                    type="link"
                    className="px-0 mt-2"
                    icon={<DownOutlined className={showMoreCategories ? 'rotate-180' : ''} />}
                    onClick={() => setShowMoreCategories((v) => !v)}
                  >
                    {showMoreCategories ? '收起' : '更多分类'}
                  </Button>
                )}
              </div>
              {/* 分割线 */}
              <div className="w-full h-[0.5px] my-2 bg-[#10182814]" />
              {/* 应用名称 */}
              <div className="flex space-x-3 items-center">
                <div className="flex-1">
                  <div className="h-6 flex items-center mb-1">
                    <span>应用名称 & 图标</span>
                  </div>
                  <div className="relative w-full">
                    <Input
                      ref={inputRef}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10"
                      placeholder="给你的应用起一个名字"
                      size="middle"
                      allowClear
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>
              {/* 描述/备注 */}
              <div>
                <div className="mb-1 flex h-6 items-center">
                  <span className="">描述</span>
                  <span>（可选）</span>
                </div>
                <TextArea rows={3} placeholder="输入应用的描述" onChange={(e) => setDescription(e.target.value)} />
              </div>
              {/* 图标与背景色 */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex h-6 items-center">图标（可选）</div>
                  <Input
                    className="w-full h-10"
                    placeholder="iconify 名称或 URL"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex h-6 items-center">图标背景色（可选）</div>
                  <Input
                    className="w-full h-10"
                    placeholder="CSS 颜色值"
                    value={iconBg}
                    onChange={(e) => setIconBg(e.target.value)}
                  />
                </div>
              </div>
              {/* 优先级、日志级别（新建时状态固定为未启动，不展示） */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex h-6 items-center">优先级</div>
                  <Select
                    className="w-full h-10"
                    size="middle"
                    value={priority}
                    onChange={setPriority}
                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ label: String(n), value: n }))}
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex h-6 items-center">日志级别</div>
                  <Select
                    options={[
                      { label: 'DEBUG', value: 1 },
                      { label: 'INFO', value: 2 },
                      { label: 'WARN', value: 3 },
                      { label: 'ERROR', value: 4 },
                    ]}
                    value={logLevel}
                    className="w-full h-10"
                    placeholder="日志级别"
                    size="middle"
                    onChange={(value) => setLogLevel(value ?? 1)}
                  />
                </div>
              </div>
            </div>
            {/* 操作按钮-跳转模板 */}
            <div className="pt-5 pb-10 flex justify-between items-center">
              <div
                className="flex gap-1 items-center cursor-pointer text-[12px] text-[#676f83] font-normal leading-4"
                onClick={onCreateFromTemplate}
              >
                <span>不知道？试试我们的模板</span>
                <div className="p-px">
                  <ArrowRightOutlined />
                </div>
              </div>
              <Space>
                <Button type="default" onClick={onCancel}>
                  {t('common.operation.cancel')}
                </Button>
                <Button type="primary" disabled={name.trim().length === 0} onClick={handleOk}>
                  {t('common.operation.confirm')}({getShortcutLabel(shotcut)})
                </Button>
              </Space>
            </div>
          </div>
        </div>
        {/* 右边显示：当前选中分类的图片或默认描述 */}
        <div className="flex-1 shrink-0 flex justify-start relative overflow-hidden">
          <div className="h-2 2xl:h-[39px] absolute left-0 top-0 right-0 border-b border-b-[#1018280a]" />
          <div className="max-w-[760px] border-x border-x-[#1018080a]">
            <div className="w-full h-2 2xl:h-[30px]" />
            <div className="px-8 py-4">
              <h4 className="text-[#354052] text-[13px] font-bold leading-4">显示描述</h4>
              {selectedCategory?.imageUrl ? (
                <img
                  src={selectedCategory.imageUrl}
                  alt={selectedCategory.name}
                  className="mt-2 max-w-full max-h-[280px] object-contain rounded"
                />
              ) : (
                <div className="text-[12px] font-normal leading-4 text-[#676f83] mt-1 min-h-8 max-w-96">
                  <span>通过简单的配置快速搭建一个基于流程的数据流动</span>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 text-(--ant-color-primary)!"
                    href="https://www.baidu.com"
                  >
                    了解更多
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DragModal>
  );
};
export default memo(AppInfoModal);

/**
 * 项目弹窗属性
 */
export interface AppInfoModalProps {
  /**
   * 窗口是否打开
   */
  open: boolean;
  /**
   * 窗口确认按钮点击回调
   * @returns
   */
  onOk: (app: Partial<EngineApp>) => void;
  /**
   * 窗口取消按钮点击回调
   * @returns
   */
  onCancel: () => void;

  /**
   * 从模板创建
   * @returns
   */
  onCreateFromTemplate: () => void;
}

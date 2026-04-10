import { EllipsisOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Tag as AntdTag, Card } from 'antd';
import type React from 'react';
import { memo, useState } from 'react';
import type { Tag } from '@/components/base/tag-management/constant';
import TagSelector from '@/components/base/tag-management/selector';
import CustomPopover from '@/components/popover';
import { usePermission } from '@/hooks/usePermission';
import type { EngineApp } from '@/services/engine/app/types';
import clsx from '@/utils/classnames';
import AppCardOperations from './AppCardOperations';
import { useAppCardModalActions } from './hooks/useAppCardModals';
import './apps.css';
import { getIcon } from '@/utils/optimized-icons';

/**
 * 应用
 * @returns
 */
const STATUS_MAP: Record<number, { text: string; color?: string; borderColor: string }> = {
  0: { text: '未启动', color: 'default', borderColor: 'rgba(0,0,0,0.12)' },
  1: { text: '正常', color: 'success', borderColor: '#52c41a' },
  2: { text: '异常', color: 'error', borderColor: '#ff4d4f' },
  3: { text: '部分异常', color: 'warning', borderColor: '#faad14' },
};

/** 应用卡片图标背景色板（未配置 iconBg 时按 id 稳定映射到其中一色，视觉上近似随机、且不随重渲染跳动） */
const APP_ICON_BG_COLORS = [
  '#1677ff',
  '#52c41a',
  '#fa8c16',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#faad14',
  '#ff4d4f',
] as const;

function getAppIconBackgroundColor(appId: string, iconBg: string | null): string {
  const custom = iconBg?.trim();
  if (custom) {
    return custom;
  }
  let h = 0;
  for (let i = 0; i < appId.length; i++) {
    h = (Math.imul(31, h) + appId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % APP_ICON_BG_COLORS.length;
  return APP_ICON_BG_COLORS[idx] ?? APP_ICON_BG_COLORS[0];
}

const AppCardInner: React.FC<AppCardProps> = ({ app, onRefresh }) => {
  const { id, name, status = 0, remark = '', updateUser, updateTime, icon, iconBg } = app;
  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP[0];
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>(app.tags ?? []);
  const hasEditorPermission = usePermission(['engine.app.edit']);
  const { openModal } = useAppCardModalActions();

  /**
   * 应用流程设计
   */
  const redirectWorkflow = (e: React.MouseEvent) => {
    e.preventDefault();
    // 跳转到流程编排界面
    navigate({ to: `/engine/${id}/flow`, params: { appId: id } });
  };

  return (
    <Card
      hoverable
      onClick={(e) => redirectWorkflow(e)}
      className="group relative col-span-1 inline-flex h-[160px] cursor-pointer flex-col overflow-hidden"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: (statusInfo ?? STATUS_MAP[0])?.borderColor ?? 'rgba(0,0,0,0.12)',
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {/* 右上角状态角标：不挤占标题，意图清晰 */}
      <div className="absolute top-2 right-2 z-10">
        <AntdTag color={statusInfo?.color ?? 'default'} className="!text-[10px] !leading-5 !m-0 !px-1.5 !py-0 !rounded">
          {statusInfo?.text ?? '未启动'}
        </AntdTag>
      </div>

      <div className="flex h-[66px] shrink-0 grow-0 items-center gap-3 px-[14px] pb-3 pt-[14px]">
        {/* icon */}
        <div
          className="relative shrink-0 p-2 text-white text-2xl w-10 h-10 rounded-md flex items-center justify-center"
          style={{ backgroundColor: getAppIconBackgroundColor(id, iconBg) }}
        >
          {getIcon(icon)}
        </div>
        {/* 应用名称与副信息 */}
        <div className="w-0 grow min-w-0 pr-16">
          <div className="flex items-center text-sm font-semibold leading-5 text-[#354052]">
            <div className="truncate" title={name}>
              {name}
            </div>
          </div>
          <div className="text-[10px] font-medium leading-[18px] text-[#676f83] truncate">
            {updateUser} · 编辑于{updateTime}
          </div>
        </div>
      </div>
      <div className="title-wrapper h-[90px] px-[14px] text-xs leading-normal text-[#676f83]">
        <div className="line-clamp-4 group-hover:line-clamp-2" title={remark}>
          {remark}
        </div>
      </div>
      {/* 隐藏部分 标签、操作按钮 */}
      <div
        className={clsx(
          'absolute bottom-1 left-0 right-0 h-[42px] shrink-0 items-center pb-[6px] pl-[14px] pr-[6px] pt-1',
          tags.length ? 'flex' : 'hidden! group-hover:flex!'
        )}
      >
        {hasEditorPermission && (
          <>
            <div
              className="flex w-0 grow items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <div
                className={clsx(
                  'mr-[41px] w-full grow group-hover:mr-0! group-hover:block!',
                  tags.length ? 'block!' : 'hidden!'
                )}
              >
                {/* 标签过滤器 */}
                <TagSelector
                  position="bl"
                  type="app"
                  targetID={id}
                  value={tags.map((tag) => tag.id) as string[]} // ensure value is string[]
                  selectedTags={tags}
                  onCacheUpdate={setTags}
                  onChange={onRefresh}
                />
              </div>
            </div>
            <div className="mx-1 hidden! h-[14px] w-px shrink-0 group-hover:flex!" />
            <div
              className="hidden! shrink-0 group-hover:flex!"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {/* 这里是下拉选择编辑 */}
              <CustomPopover
                htmlContent={
                  <AppCardOperations
                    app={app}
                    onRefresh={onRefresh}
                    setShowEditModal={() => openModal('edit', app)}
                    setShowDuplicateModal={() => openModal('duplicate', app)}
                    setShowSaveAsTemplateModal={() => openModal('saveAsTemplate', app)}
                  />
                }
                position="br"
                trigger="click"
                btnElement={
                  <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md">
                    <EllipsisOutlined className="h-4 w-4" />
                  </div>
                }
                btnClassName={(open) =>
                  clsx(
                    open ? '!bg-black/5 !shadow-none' : '!bg-transparent',
                    'h-8 w-8 rounded-md border-none !p-2 hover:!bg-black/5'
                  )
                }
                popupClassName={'!w-[184px] translate-x-[-128px]'}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

const AppCard = memo(AppCardInner);
export default AppCard;

/**
 * 应用组件属性（弹窗通过 Context 打开，不传回调以减少重渲染）
 */
export interface AppCardProps {
  app: EngineApp;
  onRefresh: () => void;
}

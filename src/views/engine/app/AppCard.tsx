import { EllipsisOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Card, Tag as AntdTag } from 'antd';
import type React from 'react';
import { memo, useState } from 'react';
import TagSelector from '@/components/base/tag-management/selector';
import CustomPopover from '@/components/popover';
import { usePermission } from '@/hooks/usePermission';
import type { EngineApp, Tag } from '@/services/engine/app/types';
import clsx from '@/utils/classnames';
import AppCardOperations from './AppCardOperations';
import { useAppCardModalActions } from './hooks/useAppCardModals';
import './apps.scss';

/**
 * 应用
 * @returns
 */
const STATUS_MAP: Record<
  number,
  { text: string; color?: string; borderColor: string }
> = {
  0: { text: '未启动', color: 'default', borderColor: 'rgba(0,0,0,0.12)' },
  1: { text: '正常', color: 'success', borderColor: '#52c41a' },
  2: { text: '异常', color: 'error', borderColor: '#ff4d4f' },
  3: { text: '部分异常', color: 'warning', borderColor: '#faad14' },
};

const AppCardInner: React.FC<AppCardProps> = ({ app, onRefresh }) => {
  const { id, name, status = 0, remark = '', updateUser, updateTime } = app;
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
    navigate({ to: `/integrated/app/${id}/workflow`, params: { appId: id } });
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
        <AntdTag
          color={statusInfo?.color ?? 'default'}
          className="!text-[10px] !leading-5 !m-0 !px-1.5 !py-0 !rounded"
        >
          {statusInfo?.text ?? '未启动'}
        </AntdTag>
      </div>

      <div className="flex h-[66px] shrink-0 grow-0 items-center gap-3 px-[14px] pb-3 pt-[14px]">
        {/* icon */}
        <div className="relative shrink-0">icon</div>
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
                    setShowSwitchModal={() => openModal('switch', app)}
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
                popupClassName={'!w-[160px] translate-x-[-128px]'}
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

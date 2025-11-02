import TagSelector from '@/components/base/tag-management/selector';
import CustomPopover from '@/components/popover';
import { usePermission } from '@/hooks/usePermission';
import type { Tag } from '@/services/common/tags/tagsModel';
import type { App } from '@/services/integrated/apps/app';
import clsx from '@/utils/classnames';
import { EllipsisOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import AppCardOperations from './AppCardOperations';
import './apps.scss';
import DuplicateAppModal from './duplicate-modal';
import EditAppModal from './edit-app-modal';
import SwitchAppModal from './swith-app-modal';

/**
 * 应用
 * @returns
 */
const AppCard: React.FC<AppCardProps> = ({ app, onRefresh }) => {
  const { id, name, type, remark = '', updateUser, updateTime } = app;
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  // 复制弹窗
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>(app.tags);
  // 是否有编辑权限
  const hasEditorPermission = usePermission(['engine.app.edit']);

  useEffect(() => {
    setTags(app.tags);
  }, [app.tags]);

  /**
   * 应用流程设计
   */
  const redirectWorkflow = (e: React.MouseEvent) => {
    e.preventDefault();
    // 跳转到流程编排界面
    navigate({ to: `/integrated/app/${id}/workflow`, params: { appId: id } });
  };

  return (
    <>
      <div
        onClick={(e) => redirectWorkflow(e)}
        className="group relative col-span-1 inline-flex h-[160px] cursor-pointer bg-[#fcfcfd] border-[#fff] flex-col rounded-xl border-[1px] border-solid shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg"
      >
        <div className="flex h-[66px] shrink-0 grow-0 items-center gap-3 px-[14px] pb-3 pt-[14px]">
          {/* icon */}
          <div className="relative shrink-0">icon</div>
          {/* 应用名称 */}
          <div className="w-0 grow py-[1px]">
            <div className="flex items-center text-sm font-semibold leading-5 text-[#354052]">
              <div className="truncate" title="工作流测试">
                {name}
              </div>
            </div>
            <div className="flex items-center text-[10px] font-medium leading-[18px] text-[#676f83]">
              <div className="truncate">
                {type}
                {updateUser} · 编辑于{updateTime}
              </div>
            </div>
          </div>
        </div>
        <div className="title-wrapper h-[90px] px-[14px] text-xs leading-normal text-[#676f83]">
          <div className="line-clamp-4 group-hover:line-clamp-2" title={remark}>
            细致描述：{remark}
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
                    tags.length ? '!block' : '!hidden'
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
                      setShowEditModal={setShowEditModal}
                      setShowDuplicateModal={setShowDuplicateModal}
                      setShowSwitchModal={setShowSwitchModal}
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
                  popupClassName={
                    app.type === 1 ? '!w-[256px] translate-x-[-224px]' : '!w-[160px] translate-x-[-128px]'
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
      {/* 编辑框 */}
      {showEditModal && (
        <EditAppModal
          open={showEditModal}
          appName={name}
          appIcon={app.icon}
          appMode={type}
          appDescription={remark || ''}
          onCancel={() => {
            setShowEditModal(false);
          }}
          onConfirm={() => {}}
        />
      )}
      {/* 复制框 */}
      {showDuplicateModal && (
        <DuplicateAppModal
          appName={name}
          icon_type={app.icon_type}
          icon={app.icon}
          icon_url={app.icon_url}
          icon_background={app.iconBg}
          show={showDuplicateModal}
          onCancel={() => {
            setShowDuplicateModal(false);
          }}
          onConfirm={() => {}}
        />
      )}
      {/* 切换应用类型弹窗 */}
      {showSwitchModal && <SwitchAppModal />}
    </>
  );
};

export default AppCard;

/**
 * 应用组件属性
 */
export interface AppCardProps {
  /**
   * 应用数据
   */
  app: App;

  /**
   * 刷新应用列表
   * @returns
   */
  onRefresh?: () => void;
}

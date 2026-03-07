import { CopyOutlined, DeleteOutlined, EditOutlined, ExportOutlined, SwitcherOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App as AntdApp, Divider } from 'antd';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { HtmlContentProps } from '@/components/popover';
import { appService } from '@/services/engine';
import type { EngineApp } from '@/services/engine/app/types';

interface AppCardOperationsProps extends HtmlContentProps {
  app: EngineApp;
  onRefresh?: () => void;
  setShowEditModal: (show: boolean) => void;
  setShowDuplicateModal: (show: boolean) => void;
  setShowSwitchModal: (show: boolean) => void;
}

/**
 * 应用卡片操作
 */
const AppCardOperations: React.FC<AppCardOperationsProps> = ({
  app,
  onRefresh,
  setShowEditModal,
  setShowDuplicateModal,
  setShowSwitchModal,
  ...props
}) => {
  const { id } = app;
  const { message, modal } = AntdApp.useApp();
  const { t } = useTranslation();

  // 处理应用修改
  const updateAppMutation = useMutation({
    mutationFn: (app: Partial<EngineApp>) => appService.updateApp(id, app),
    onSuccess: () => {
      message.success(t('app.updateApp.success'));
      onRefresh?.();
      // 关闭编辑弹窗
      setShowEditModal(false);
    },
    onError: (error) => {
      modal.error({
        title: t('app.updateApp.error.title'),
        content: t('app.updateApp.error.content', { error: error.message }),
      });
    },
  });

  // 处理应用删除
  const deleteAppMutation = useMutation({
    mutationFn: (id: string) => appService.deleteApp(id),
    onSuccess: () => {
      message.success(t('app.deleteApp.success'));
      onRefresh?.();
    },
    onError: (error) => {
      modal.error({
        title: t('app.deleteApp.error.title'),
        content: t('app.deleteApp.error.content', { error: error.message }),
      });
    },
  });

  // 复制应用
  const copyAppMutation = useMutation({
    mutationFn: (app: Partial<EngineApp>) => appService.createApp(app),
    onSuccess: () => {
      message.success(t('app.copyApp.success'));
      // 刷新列表
      onRefresh?.();
      // 关闭复制弹窗
      setShowDuplicateModal(false);
    },
    onError: (error) => {
      modal.error({
        title: t('app.copyApp.error.title'),
        content: t('app.copyApp.error.content', { error: error.message }),
      });
    },
  });

  /**
   * 确认删除应用
   */
  const onConfirmDelete = useCallback(() => {
    deleteAppMutation.mutate(id);
  }, [id, onRefresh]);

  /**
   * 编辑应用
   */
  const onEdit = useCallback(async () => {
    updateAppMutation.mutate(app);
  }, [app, onRefresh]);

  /**
   * 复制应用(有一个复制弹窗)
   */
  const onCopy = async ({ name, icon_type, icon, iconBg }: Partial<EngineApp>) => {
    copyAppMutation.mutate({
      name,
      icon_type,
      icon,
      iconBg,
    });
  };

  /**
   * 导出应用
   */
  const onExport = async () => {};

  /**
   * 导出检测
   */
  const exportCheck = async () => {};

  /**
   * 切换应用
   * @param type 应用类型
   */
  const onSwitch = (type?: number) => {};

  const onMouseLeave = async () => {
    props.onClose?.();
  };

  // 点击设置
  const onClickSetting = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    setShowEditModal(true);
  };

  // 点击复制
  const onClickDuplicate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    setShowDuplicateModal(true);
  };

  // 点击导出
  const onClickExport = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    exportCheck();
  };

  // 点击切换
  const onClickSwitch = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    setShowSwitchModal(true);
  };

  // 点击删除
  const onClickDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    // 询问是否删除
    modal.confirm({
      title: t('app.deleteAppConfirmTitle'),
      content: t('app.deleteAppConfirmContent'),
      width: 480,
      onOk: onConfirmDelete,
    });
  };

  return (
    <div className="relative w-full py-1" onMouseLeave={onMouseLeave}>
      <button
        type="button"
        className="mx-1 flex h-8 w-[calc(100%_-_8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-[#c8ceda33]"
        onClick={onClickSetting}
      >
        <span className="text-[13px] text-zinc-500">
          <EditOutlined className="w-4 h-4 mr-2" />
          {t('app.editApp')}
        </span>
      </button>
      <Divider className="!my-1" />
      <button
        type="button"
        className="mx-1 flex h-8 w-[calc(100%_-_8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-[#c8ceda33]"
        onClick={onClickDuplicate}
      >
        <span className="text-[13px] text-zinc-500">
          <CopyOutlined className="w-4 h-4  mr-2" />
          {t('app.duplicate')}
        </span>
      </button>
      <button
        type="button"
        className="mx-1 flex h-8 w-[calc(100%_-_8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-[#c8ceda33]"
        onClick={onClickExport}
      >
        <span className="text-[13px] text-zinc-500">
          <ExportOutlined className="w-4 h-4  mr-2" />
          {t('app.export')}
        </span>
      </button>
      {app.type === 1 && (
        <>
          <Divider className="!my-1" />
          <div
            className="mx-1 flex h-9 cursor-pointer items-center rounded-lg px-3 py-2 hover:bg-[#c8ceda33]"
            onClick={onClickSwitch}
          >
            <span className="text-sm leading-5 text-zinc-500">
              <SwitcherOutlined className="w-4 h-4 mr-2" />
              {t('app.switch')}
            </span>
          </div>
        </>
      )}
      <Divider className="!my-1" />
      <div
        className="group mx-1 flex h-8 w-[calc(100%_-_8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-[#fef3f2]"
        onClick={onClickDelete}
      >
        <span className="text-[13px] text-zinc-500 group-hover:text-red-500">
          <DeleteOutlined className="w-4 h-4 mr-2" />
          {t('common.operation.delete')}
        </span>
      </div>
    </div>
  );
};

export default AppCardOperations;

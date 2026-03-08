import { CopyOutlined, DeleteOutlined, EditOutlined, ExportOutlined, SwitcherOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App as AntdApp, Divider } from 'antd';
import type React from 'react';
import { useCallback, useEffect } from 'react';
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
  /** 注册切换应用回调，供 SwitchAppModal 确认时调用 */
  registerSwitchHandler?: (handler: (type?: number) => void) => void;
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
  registerSwitchHandler,
  ...props
}) => {
  const { id } = app;
  const { message, modal } = AntdApp.useApp();
  const { t } = useTranslation();

  // 处理应用删除（编辑/复制由 AppCard 内弹窗提交后调用 appService）
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

  /**
   * 确认删除应用
   */
  const onConfirmDelete = useCallback(() => {
    deleteAppMutation.mutate(id);
  }, [id, deleteAppMutation]);

  /**
   * 导出应用：请求应用基础信息及其下所有流程的编排快照，并触发 JSON 文件下载，供其他服务或导入功能使用。
   */
  const exportCheck = async () => {
    try {
      const data = await appService.exportApp(id);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (app.name || 'app').replace(/[/\\?%*:|"<>]/g, '_');
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
      link.download = `app-export-${safeName}-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success(t('app.exportSuccess') ?? '导出成功');
    } catch (error) {
      modal.error({
        title: t('app.exportError.title') ?? '导出失败',
        content: (error as Error).message,
      });
    }
  };

  /**
   * 切换应用（阶段一占位）
   */
  const handleSwitch = useCallback(
    (_type?: number) => {
      message.info(t('app.switch') ?? '切换功能敬请期待');
    },
    [message, t]
  );

  useEffect(() => {
    registerSwitchHandler?.(handleSwitch);
    return () => {
      registerSwitchHandler?.((_t?: number) => {
        /* cleanup: unregister */
      });
    };
  }, [registerSwitchHandler, handleSwitch]);

  const onMouseLeave = async () => {
    props.onClose?.();
  };

  /** 关闭 CustomPopover 并执行回调 */
  const closePopover = useCallback(() => {
    props.onClose?.();
  }, [props.onClose]);

  // 点击设置
  const onClickSetting = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    closePopover();
    setShowEditModal(true);
  };

  // 点击复制
  const onClickDuplicate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    closePopover();
    setShowDuplicateModal(true);
  };

  /**
   * 点击导出：阻止冒泡后执行导出（调用 exportCheck 下载应用与流程编排 JSON）。
   */
  const onClickExport = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    closePopover();
    await exportCheck();
  };

  // 点击切换
  const onClickSwitch = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    closePopover();
    setShowSwitchModal(true);
  };

  // 点击删除
  const onClickDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    props.onClick?.();
    e.preventDefault();
    closePopover();
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
        className="mx-1 flex h-8 w-[calc(100%-8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-[#c8ceda33]"
        onClick={onClickSetting}
      >
        <span className="text-[13px] text-zinc-500">
          <EditOutlined className="w-4 h-4 mr-2" />
          {t('app.editApp')}
        </span>
      </button>
      <Divider className="my-1!" />
      <button
        type="button"
        className="mx-1 flex h-8 w-[calc(100%-8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-[#c8ceda33]"
        onClick={onClickDuplicate}
      >
        <span className="text-[13px] text-zinc-500">
          <CopyOutlined className="w-4 h-4  mr-2" />
          {t('app.duplicate')}
        </span>
      </button>
      <button
        type="button"
        className="mx-1 flex h-8 w-[calc(100%-8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-[#c8ceda33]"
        onClick={onClickExport}
      >
        <span className="text-[13px] text-zinc-500">
          <ExportOutlined className="w-4 h-4  mr-2" />
          {t('app.export')}
        </span>
      </button>
      {app.type === 1 && (
        <>
          <Divider className="my-1!" />
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
      <Divider className="my-1!" />
      <div
        className="group mx-1 flex h-8 w-[calc(100%-8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-[#fef3f2]"
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

import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  SaveOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App as AntdApp, Menu } from 'antd';
import type { MenuProps } from 'antd';
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
  setShowSaveAsTemplateModal?: (show: boolean) => void;
}

/**
 * 应用卡片操作（antd Menu 分组展示）
 */
const AppCardOperations: React.FC<AppCardOperationsProps> = ({
  app,
  onRefresh,
  setShowEditModal,
  setShowDuplicateModal,
  setShowSwitchModal,
  setShowSaveAsTemplateModal,
  ...props
}) => {
  const { id } = app;
  const { message, modal } = AntdApp.useApp();
  const { t } = useTranslation();

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

  const onConfirmDelete = useCallback(() => {
    deleteAppMutation.mutate(id);
  }, [id, deleteAppMutation]);

  const exportCheck = useCallback(async () => {
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
  }, [id, app.name, message, modal, t]);

  const closePopover = useCallback(() => {
    props.onClose?.();
  }, [props.onClose]);

  const runAndClose = useCallback(
    (fn: () => void) => {
      closePopover();
      fn();
    },
    [closePopover]
  );

  const menuItems: MenuProps['items'] = [
    {
      type: 'group',
      label: t('common.operation.operate') ?? '操作',
      children: [
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: t('app.editApp'),
          onClick: () => runAndClose(() => setShowEditModal(true)),
        },
        {
          key: 'duplicate',
          icon: <CopyOutlined />,
          label: t('app.duplicate'),
          onClick: () => runAndClose(() => setShowDuplicateModal(true)),
        },
        {
          key: 'export',
          icon: <ExportOutlined />,
          label: t('app.export'),
          onClick: () => runAndClose(exportCheck),
        },
        ...(setShowSaveAsTemplateModal
          ? [
              {
                key: 'saveAsTemplate',
                icon: <SaveOutlined />,
                label: t('app.saveAsTemplate'),
                onClick: () => runAndClose(() => setShowSaveAsTemplateModal(true)),
              },
            ]
          : []),
      ],
    },
    ...(app.type === 1
      ? [
          {
            type: 'group' as const,
            label: t('app.switch') ?? '切换',
            children: [
              {
                key: 'switch',
                icon: <SwitcherOutlined />,
                label: t('app.switch'),
                onClick: () => runAndClose(() => setShowSwitchModal(true)),
              },
            ],
          },
        ]
      : []),
    {
      type: 'group',
      label: '',
      children: [
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: t('common.operation.delete'),
          danger: true,
          onClick: () =>
            runAndClose(() =>
              modal.confirm({
                title: t('app.deleteAppConfirmTitle'),
                content: t('app.deleteAppConfirmContent'),
                width: 480,
                onOk: onConfirmDelete,
              })
            ),
        },
      ],
    },
  ];

  return (
    <div onMouseLeave={() => props.onClose?.()}>
      <Menu
        mode="vertical"
        selectable={false}
        items={menuItems}
        className="border-0! bg-transparent!"
        style={{ minWidth: 160 }}
      />
    </div>
  );
};

export default AppCardOperations;

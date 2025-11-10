import type { App, AppModalState } from '@/services/integrated/apps/app.ts';
import { appsService } from '@/services/integrated/apps/appsApi.ts';
import { ExportOutlined, FileAddFilled, PlusOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Card } from 'antd';
import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import AppCreate from './create-app-modal';
import ImportDsl from './create-from-dsl-modal';

// 模版中心
const AppTemplates = React.lazy(() => import('./create-app-template/index.tsx'));

// 提取关闭弹窗的逻辑
const closeAllModals = (dispatch: React.Dispatch<Partial<AppModalState>>) => {
  dispatch({
    openAddModal: false,
    openTemplateModal: false,
    openImportModal: false,
  });
};

type CreateAppCardProps = {
  refresh?: () => void;
};

/**
 * 创建应用卡片
 */
const CreateAppCard: React.FC<CreateAppCardProps> = ({ refresh }) => {
  const { t } = useTranslation();

  // 新增弹窗、模版弹窗、导入弹窗
  const [state, dispatch] = useReducer(
    (prev: AppModalState, action: Partial<AppModalState>) => ({
      ...prev,
      ...action,
    }),
    {
      // 新增窗口的打开状态
      openAddModal: false,
      // 模版窗口的打开状态
      openTemplateModal: false,
      // 导入窗口的打开状态
      openImportModal: false,
    }
  );

  // 处理应用新增
  const addAppMutation = useMutation({
    mutationFn: (app: Partial<App>) => appsService.addApp(app),
    onSuccess: () => {
      refresh?.();
      // 关闭弹窗
      dispatch({
        openAddModal: false,
      });
    },
  });

  /**
   * 新增应用
   */
  const addApp = () => {
    dispatch({
      openAddModal: true,
    });
  };

  /**
   * 打开模版中心
   */
  const openTemplate = () => {
    dispatch({
      openAddModal: false,
      openTemplateModal: true,
      openImportModal: false,
    });
  };

  /**
   * 关闭模版中心
   */
  const closeTemplate = () => {
    dispatch({
      openTemplateModal: false,
    });
  };

  /**
   * 打开文件导入弹窗
   */
  const openImport = () => {
    dispatch({
      openAddModal: false,
      openTemplateModal: false,
      openImportModal: true,
    });
  };

  /**
   * 从模版创建应用
   */
  const onCreateFromTemplate = () => {
    dispatch({
      openAddModal: false,
      openTemplateModal: true,
      openImportModal: false,
    });
  };

  /**
   * 从空白创建应用
   */
  const onCreateFromBlank = () => {
    dispatch({
      openAddModal: true,
      openTemplateModal: false,
      openImportModal: false,
    });
  };

  /**
   * 关闭文件导入弹窗
   */
  const closeImport = () => {
    closeAllModals(dispatch);
  };

  /**
   * 新增（编辑）应用确认
   */
  const onModalOk = (app: Partial<App>) => {
    addAppMutation.mutate(app);
  };

  /**
   * 新增应用取消
   */
  const onModalCancel = () => {
    dispatch({
      openAddModal: false,
    });
  };

  return (
    <>
      <Card
        className="relative col-span-1 inline-flex flex-col justify-between h-[160px] rounded-xl"
        classNames={{ body: 'grow p-2! rounded-t-xl' }}
      >
        <div className="px-6 pt-2 pb-1 text-xs font-medium leading-[18px] text-[#676f83]">
          {t('app.newApp.createApp')}
        </div>
        <button
          className="w-full flex items-center mb-1 px-6 py-[7px] rounded-lg text-[13px] font-medium leading-[18px] text-[#676f83] cursor-pointer hover:bg-[#f5f6f7] hover:text-[#1e1e2d] transition-all duration-200 ease-in-out"
          onClick={addApp}
          type="button"
        >
          <PlusOutlined className="text-[#676f83] shrink-0 mr-2 w-4 h-4" />
          {t('app.newApp.startFromBlank')}
        </button>
        <button
          className="w-full flex items-center px-6 py-[7px] rounded-lg text-[13px] font-medium leading-[18px] text-[#676f83] cursor-pointer hover:bg-[#f5f6f7] hover:text-[#1e1e2d] transition-all duration-200 ease-in-out"
          onClick={openTemplate}
          type="button"
        >
          <FileAddFilled className="text-[#676f83] shrink-0 mr-2 w-4 h-4" />
          {t('app.newApp.startFromTemplate')}
        </button>
        <button
          className="w-full flex items-center px-6 py-[7px] rounded-lg text-[13px] font-medium leading-[18px] text-[#676f83] cursor-pointer hover:bg-[#f5f6f7] hover:text-[#1e1e2d] transition-all duration-200 ease-in-out"
          onClick={openImport}
          type="button"
        >
          <ExportOutlined className="text-[#676f83] shrink-0 mr-2 w-4 h-4" />
          {t('app.newApp.importFromDSL')}
        </button>
      </Card>
      {/* 新增弹窗 */}
      <AppCreate
        open={state.openAddModal}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onCreateFromTemplate={onCreateFromTemplate}
      />
      {/* 模版中心 */}
      <AppTemplates open={state.openTemplateModal} onClose={closeTemplate} onCreateFromBlank={onCreateFromBlank} />
      {/* 导入DSL */}
      <ImportDsl open={state.openImportModal} onClose={closeImport} />
    </>
  );
};
export default CreateAppCard;

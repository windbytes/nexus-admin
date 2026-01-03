import { App, Input, Modal } from 'antd';
import type React from 'react';
import { useId, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { MenuExportParams } from '@/services/system/menu/menuApi';
import { menuService } from '@/services/system/menu/menuApi';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  searchText?: string;
}

/**
 * 导出菜单模态框组件
 */
const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, searchText = '' }) => {
  const { message, modal } = App.useApp();
  const exportMenuNameId = useId();
  const [exportParams, setExportParams] = useState<MenuExportParams>({ name: searchText });

  // 导出菜单mutation
  const exportMenuMutation = useMutation({
    mutationFn: async (params: MenuExportParams) => {
      return await menuService.exportMenus(params);
    },
    onSuccess: (blob) => {
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `菜单数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('导出成功！');
      onClose();
    },
    onError: (error) => {
      modal.error({
        title: '菜单导出失败',
        content: `导出菜单时发生错误：${error.message || '未知错误'}。请检查网络连接或联系技术支持。`,
      });
    },
  });

  /**
   * 确认导出
   */
  const handleConfirm = () => {
    exportMenuMutation.mutate(exportParams);
  };

  return (
    <Modal
      title="导出菜单"
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      confirmLoading={exportMenuMutation.isPending}
      width={400}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor={exportMenuNameId} className="block text-sm font-medium text-gray-700 mb-2">
            菜单名称筛选
          </label>
          <Input
            id={exportMenuNameId}
            placeholder="请输入菜单名称（可选）"
            value={exportParams.name || ''}
            onChange={(e) => setExportParams((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="text-gray-600 text-sm">
          <p>• 将导出为 Excel 格式文件</p>
          <p>• 如果填写菜单名称，将只导出匹配的菜单</p>
          <p>• 不填写则导出所有菜单</p>
        </div>
      </div>
    </Modal>
  );
};

ExportModal.displayName = 'ExportModal';

export default ExportModal;


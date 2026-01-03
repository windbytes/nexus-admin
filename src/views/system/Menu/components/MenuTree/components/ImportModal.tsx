import { ImportOutlined } from '@ant-design/icons';
import { App, Button, Modal, Upload } from 'antd';
import type React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services/system/menu/menuApi';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 导入菜单模态框组件
 */
const ImportModal: React.FC<ImportModalProps> = ({ open, onClose }) => {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  // 导入菜单mutation
  const importMenuMutation = useMutation({
    mutationFn: async (file: File) => {
      return await menuService.importMenus(file);
    },
    onSuccess: (result) => {
      if (result.success) {
        message.success(`导入成功！成功导入 ${result.successCount} 条菜单`);
        // 重新获取菜单数据
        queryClient.invalidateQueries({ queryKey: ['sys_menu'] });
        onClose();
      } else {
        modal.error({
          title: '菜单导入失败',
          content: `导入失败！失败 ${result.failCount} 条菜单。请检查导入文件格式或联系技术支持。`,
        });
      }

      // 显示详细结果
      if (result.details && result.details.length > 0) {
        const successDetails = result.details.filter((item) => item.status === 'success');
        const failDetails = result.details.filter((item) => item.status === 'fail');

        if (successDetails.length > 0) {
          message.info(`成功导入: ${successDetails.map((item) => item.name).join(', ')}`);
        }

        if (failDetails.length > 0) {
          modal.error({
            title: '部分菜单导入失败',
            content: `以下菜单导入失败: ${failDetails.map((item) => `${item.name}(${item.message})`).join(', ')}。请检查失败原因后重试。`,
          });
        }
      }
    },
    onError: (error) => {
      modal.error({
        title: '菜单导入失败',
        content: `导入菜单时发生错误：${error.message || '未知错误'}。请检查网络连接或联系技术支持。`,
      });
    },
  });

  /**
   * 验证文件格式
   */
  const validateFileFormat = (file: File): boolean => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      modal.error({
        title: '文件格式不支持',
        content: '只支持 Excel 文件格式 (.xlsx, .xls)。请选择正确的文件格式后重试。',
      });
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      modal.error({
        title: '文件过大',
        content: '文件大小不能超过 10MB。请选择较小的文件后重试。',
      });
      return false;
    }

    return true;
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = async (file: File) => {
    if (!validateFileFormat(file)) {
      return false;
    }
    await importMenuMutation.mutateAsync(file);
    return false; // 阻止自动上传
  };

  return (
    <Modal title="导入菜单" open={open} onCancel={onClose} footer={null} width={500}>
      <div className="space-y-4">
        <div className="text-gray-600 text-sm">
          <p>• 支持 Excel 文件格式 (.xlsx, .xls)</p>
          <p>• 文件大小不能超过 10MB</p>
          <p>• 请确保 Excel 文件包含必要的列：菜单名称、菜单类型、排序等</p>
        </div>

        <Upload
          accept=".xlsx,.xls"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          disabled={importMenuMutation.isPending}
        >
          <Button type="dashed" block icon={<ImportOutlined />} loading={importMenuMutation.isPending}>
            选择 Excel 文件
          </Button>
        </Upload>

        {importMenuMutation.isPending && <div className="text-center text-blue-500">正在导入，请稍候...</div>}
      </div>
    </Modal>
  );
};

ImportModal.displayName = 'ImportModal';

export default ImportModal;


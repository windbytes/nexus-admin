import React, { memo } from 'react';
import { Button, Space } from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
} from '@ant-design/icons';

interface ActionButtonsProps {
  /** 是否处于编辑模式 */
  isEditing: boolean;
  /** 是否有选中的端点类型 */
  hasSelected: boolean;
  /** 保存按钮加载状态 */
  saveLoading?: boolean;
  /** 预览回调 */
  onPreview: () => void;
  /** 编辑回调 */
  onEdit: () => void;
  /** 保存回调 */
  onSave: () => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 删除回调 */
  onDelete: () => void;
  /** 导出回调 */
  onExport: () => void;
  /** 导入回调 */
  onImport: () => void;
}

/**
 * 操作按钮组件
 * 将按钮区域独立拆分，避免主组件重渲染时影响按钮区域
 */
const ActionButtons: React.FC<ActionButtonsProps> = memo(({
  isEditing,
  hasSelected,
  saveLoading = false,
  onPreview,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onExport,
  onImport,
}) => {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex justify-end">
        <Space>
          <Button color='cyan' variant='outlined' icon={<EyeOutlined />} onClick={onPreview}>
            预览
          </Button>
          {!isEditing ? (
            <>
              <Button
                color="orange"
                variant="outlined"
                icon={<SaveOutlined />}
                disabled={!hasSelected}
                onClick={onEdit}
              >
                编辑
              </Button>
              <Button
                icon={<ExportOutlined />}
                disabled={!hasSelected}
                onClick={onExport}
              >
                导出
              </Button>
              <Button icon={<ImportOutlined />} onClick={onImport}>
                导入
              </Button>
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={!hasSelected}
                onClick={onDelete}
              >
                删除
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onCancel}>取消</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saveLoading}
                onClick={onSave}
              >
                保存
              </Button>
            </>
          )}
        </Space>
      </div>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;


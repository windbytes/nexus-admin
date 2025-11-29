import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { usePlayground } from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 切换编辑器是否只读模式
 * @returns
 */
export const Readonly = () => {
  const { t } = useTranslation();
  const playground = usePlayground();

  /**
   * 切换只读模式
   */
  const toggleReadonly = useCallback(() => {
    playground.config.readonly = !playground.config.readonly;
  }, [playground]);

  return (
    <Tooltip title={t(playground.config.readonly ? 'editable' : 'readonly')}>
      <Button
        type="text"
        icon={
          playground.config.readonly ? <LockOutlined /> : <UnlockOutlined />
        }
        onClick={toggleReadonly}
      />
    </Tooltip>
  );
};

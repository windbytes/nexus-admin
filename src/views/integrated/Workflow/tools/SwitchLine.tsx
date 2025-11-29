import { useService, WorkflowLinesManager } from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconSwitchLine } from '../assets/icon-switch-line';

/**
 * 切换线条样式
 * @returns
 */
const SwitchLine: React.FC = () => {
  const { t } = useTranslation();
  const linesManager = useService(WorkflowLinesManager);
  const switchLine = useCallback(() => {
    linesManager.switchLineType();
  }, [linesManager]);
  return (
    <Tooltip title={t('workflow.tools.switchLine')}>
      <Button type="text" icon={IconSwitchLine} onClick={switchLine} />
    </Tooltip>
  );
};

export default SwitchLine;

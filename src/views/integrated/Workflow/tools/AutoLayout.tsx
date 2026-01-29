import { usePlayground, usePlaygroundTools } from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconAutoLayout } from '../assets/icon-auto-layout';

/**
 * 整理节点
 * @returns
 */
const AutoLayout: React.FC = () => {
  const { t } = useTranslation();
  const playground = usePlayground();
  const tools = usePlaygroundTools();
  const autoLayout = useCallback(async () => {
    await tools.autoLayout({
      enableAnimation: true,
      animationDuration: 1000,
      layoutConfig: {
        rankdir: 'LR',
        align: undefined,
        nodesep: 100,
        ranksep: 100,
      },
    });
  }, [tools]);
  return (
    <Tooltip title={t('workflow.tools.autoLayout')} color="white">
      <Button type="text" onClick={autoLayout} disabled={playground.config.readonly} icon={IconAutoLayout} />
    </Tooltip>
  );
};

export default AutoLayout;

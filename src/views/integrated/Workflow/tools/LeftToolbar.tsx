import { PlusCircleFilled, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useClientContext, useRefresh } from '@flowgram.ai/free-layout-editor';
import type { NodePanelResult } from '@flowgram.ai/free-node-panel-plugin';
import { Button, Popover, theme, Tooltip } from 'antd';
import { useCallback, useEffect } from 'react';
import NodeList from '../components/node-panel/node-list';
import AutoLayout from './AutoLayout';
import ExportImage from './ExportImage';
import { Readonly } from './readonly';
import SwitchLine from './SwitchLine';

/**
 * 左侧工具栏组件
 * @returns
 */
const LeftToolbar: React.FC = () => {
  const { token } = theme.useToken();
  const { playground, document, selection } = useClientContext();

  // 刷新钩子
  const refresh = useRefresh();

  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() => refresh());
    return () => disposable.dispose();
  }, [playground]);

  /**
   * 选择节点回调
   * @param panelParams 节点面板参数
   */
  const onSelect = useCallback(async (panelParams?: NodePanelResult) => {
    if (!panelParams) return;
    const { nodeType, nodeJSON } = panelParams;
    console.log('选中的节点', nodeType, nodeJSON);
  }, []);

  return (
    <div className="absolute left-0 top-0 z-20 flex w-12 items-center justify-center p-1 pl-2 h-full">
      <div className="flex flex-col items-center bg-white rounded-lg p-0.5 shadow-lg">
        <Tooltip title="添加节点">
          <Popover
            arrow={false}
            placement="right"
            align={{ offset: [0, 80] }}
            content={<NodeList onSelect={onSelect} />}
            trigger="click"
          >
            <Button type="text" icon={<PlusCircleFilled />} />
          </Popover>
        </Tooltip>
        <Tooltip title="添加注释">
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            onClick={() => console.log('添加')}
            style={{ color: token.colorPrimary }}
          />
        </Tooltip>
        <SwitchLine />
        <Readonly />
        <ExportImage />
        <AutoLayout />
        <Tooltip title="设置">
          <Button type="text" icon={<SettingOutlined />} onClick={() => console.log('设置')} />
        </Tooltip>
      </div>
    </div>
  );
};

export default LeftToolbar;

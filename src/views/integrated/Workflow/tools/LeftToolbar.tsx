import { PlusCircleFilled, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useClientContext, useRefresh } from '@flowgram.ai/free-layout-editor';
import { Button, theme, Tooltip } from 'antd';
import { useEffect } from 'react';
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
  const { playground } = useClientContext();

  // 刷新钩子
  const refresh = useRefresh();

  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() => refresh());
    return () => disposable.dispose();
  }, [playground]);

  return (
    <div className="absolute left-0 top-0 z-20 flex w-12 items-center justify-center p-1 pl-2 h-full">
      <div className="flex flex-col items-center bg-white rounded-lg p-0.5 shadow-lg">
        <Tooltip title="添加节点">
          <Button type="text" icon={<PlusCircleFilled />} onClick={() => console.log('添加节点')} />
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

import { UndoOutlined } from '@ant-design/icons';
import { InteractiveType, useClientContext, usePlaygroundTools, useRefresh } from '@flowgram.ai/free-layout-editor';
import { Button, Divider } from 'antd';
import { useEffect, useState } from 'react';
import AutoLayout from './auto-layout';
import { Comment } from './comment';
import FitView from './fit-view';
import MiniMap from './minimap';
import MinimapSwitch from './minimap-switch';
import { Readonly } from './readonly';
import SwitchLine from './switch-line';
import ZoomSelect from './zoom-select';

/**
 * 流程编排工具组件
 * @returns
 */
const WorkflowTools: React.FC = () => {
  const { history, playground } = useClientContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [minimapVisible, setMinimapVisible] = useState(true);
  const tools = usePlaygroundTools();
  useEffect(() => {
    const disposable = history.undoRedoService.onChange(() => {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    });
    return () => {
      disposable.dispose();
    };
  }, [history]);

  // 刷新钩子
  const refresh = useRefresh();

  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() => refresh());
    return () => disposable.dispose();
  }, [playground]);

  // 默认设置鼠标交互
  useEffect(() => {
    tools.setInteractiveType(InteractiveType.MOUSE);
  }, []);

  return (
    <div className="absolute bottom-4 flex justify-start min-w-[360px] pointer-none gap-2 z-99 ml-2">
      <div className="flex items-center bg-white rounded-[6px] p-1">
        {/* 自动布局 */}
        <AutoLayout />
        {/* 切换线条样式 */}
        <SwitchLine />
        {/* 切换大小 */}
        <ZoomSelect />
        {/* 视图自适应 */}
        <FitView />
        {/* 显示隐藏缩略图 */}
        <MinimapSwitch minimapVisible={minimapVisible} setMinimapVisible={setMinimapVisible} />
        {/* 缩略图 */}
        <MiniMap visible={minimapVisible} />
        {/* 切换只读模式 */}
        <Readonly />
        {/* 撤销 */}
        <Button
          type="text"
          icon={<UndoOutlined />}
          disabled={!canUndo || playground.config.readonly}
          onClick={() => {
            history.undo();
          }}
        />
        {/* 重做 */}
        <Button
          type="text"
          icon={<UndoOutlined />}
          disabled={!canRedo || playground.config.readonly}
          onClick={() => {
            history.redo();
          }}
        />
        {/* 分界线 */}
        <Divider type="vertical" className="h-4 m-0.5" />
        {/* 添加注释组件 */}
        <Comment />
        {/* 添加节点 */}
      </div>
    </div>
  );
};
export default WorkflowTools;

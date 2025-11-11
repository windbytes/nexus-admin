import { HistoryOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { useClientContext } from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

/**
 * 历史记录控制按钮组（撤销/重做/历史记录）
 * @returns
 */
const HistoryControls: React.FC = () => {
  const { history, playground } = useClientContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  useEffect(() => {
    const disposable = history.undoRedoService.onChange(() => {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    });
    return () => {
      disposable.dispose();
    };
  }, [history]);
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg shadow-lg">
      <Tooltip title="撤销">
        <Button
          type="text"
          icon={<UndoOutlined />}
          disabled={!canUndo || playground.config.readonly}
          onClick={() => {
            history.undo();
          }}
        />
      </Tooltip>
      <Tooltip title="重做">
        <Button
          type="text"
          icon={<RedoOutlined />}
          disabled={!canRedo || playground.config.readonly}
          onClick={() => {
            history.redo();
          }}
        />
      </Tooltip>
      <Tooltip title="历史记录">
        <Button type="text" icon={<HistoryOutlined />} onClick={() => console.log('历史记录')} />
      </Tooltip>
    </div>
  );
};

export default HistoryControls;

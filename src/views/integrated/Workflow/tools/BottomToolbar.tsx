import { useState } from 'react';
import HistoryControls from './HistoryControls';
import MiniMap from './minimap';
import MinimapSwitch from './minimap-switch';
import ZoomSelect from './ZoomSelect';

/**
 * 底部工具栏组件
 * @returns
 */
const BottomToolbar: React.FC = () => {
  const [minimapVisible, setMinimapVisible] = useState(true);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-1000 px-2 pb-2 flex items-center justify-between">
      {/* 左侧：撤销、重做、历史记录 */}
      <HistoryControls />

      {/* 右侧：缩放控制 */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-lg">
        {/* 显示隐藏缩略图 */}
        <MinimapSwitch minimapVisible={minimapVisible} setMinimapVisible={setMinimapVisible} />
        {/* 缩略图 */}
        <MiniMap visible={minimapVisible} />
        <ZoomSelect />
      </div>
    </div>
  );
};

export default BottomToolbar;

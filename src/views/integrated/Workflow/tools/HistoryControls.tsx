import { HistoryOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

/**
 * 历史记录控制按钮组（撤销/重做/历史记录）
 * @returns
 */
const HistoryControls: React.FC = () => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg shadow-lg">
      <Tooltip title="撤销">
        <Button type="text" icon={<UndoOutlined />} onClick={() => console.log('撤销')} />
      </Tooltip>
      <Tooltip title="重做">
        <Button type="text" icon={<RedoOutlined />} onClick={() => console.log('重做')} />
      </Tooltip>
      <Tooltip title="历史记录">
        <Button type="text" icon={<HistoryOutlined />} onClick={() => console.log('历史记录')} />
      </Tooltip>
    </div>
  );
};

export default HistoryControls;

import { HistoryOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';

/**
 * 历史记录控制按钮组（撤销/重做/历史记录）
 * @returns
 */
const HistoryControls: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg"
      style={{
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorder}`,
      }}
    >
      <Button type="text" size="small" icon={<UndoOutlined />} onClick={() => console.log('撤销')} />
      <Button type="text" size="small" icon={<RedoOutlined />} onClick={() => console.log('重做')} />
      <Button type="text" size="small" icon={<HistoryOutlined />} onClick={() => console.log('历史记录')} />
    </div>
  );
};

export default HistoryControls;


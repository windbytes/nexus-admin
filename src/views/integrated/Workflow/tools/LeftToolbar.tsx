import { PlusCircleFilled, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, theme, Tooltip } from 'antd';
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

  return (
    <div className="absolute left-0 top-20 z-1000 flex flex-col items-center bg-white rounded-lg p-1 shadow-lg">
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
  );
};

export default LeftToolbar;

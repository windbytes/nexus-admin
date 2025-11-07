import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { usePlayground, usePlaygroundTools } from '@flowgram.ai/free-layout-editor';
import type { MenuProps } from 'antd';
import { Button, Dropdown, theme } from 'antd';

/**
 * 缩放选择
 * @returns
 */
const ZoomSelect: React.FC = () => {
  const tools = usePlaygroundTools();
  const playound = usePlayground();
  const { token } = theme.useToken();

  // 当前缩放比例
  const currentZoom = Math.floor(tools.zoom * 100);

  // 缩放选项
  const items: MenuProps['items'] = [
    {
      label: (
        <div className="flex items-center justify-between">
          <span>200%</span>
        </div>
      ),
      key: 'zoomTo200',
      onClick: () => playound.config.updateZoom(2),
    },
    {
      label: (
        <div className="flex items-center justify-between">
          <span>100%</span>
          <span className="ml-8 text-gray-400">Shift 1</span>
        </div>
      ),
      key: 'zoomTo100',
      onClick: () => playound.config.updateZoom(1),
    },
    {
      label: (
        <div className="flex items-center justify-between">
          <span>75%</span>
        </div>
      ),
      key: 'zoomTo75',
      onClick: () => playound.config.updateZoom(0.75),
    },
    {
      label: (
        <div className="flex items-center justify-between">
          <span>50%</span>
          <span className="ml-8 text-gray-400">Shift 5</span>
        </div>
      ),
      key: 'zoomTo50',
      onClick: () => playound.config.updateZoom(0.5),
    },
    {
      label: (
        <div className="flex items-center justify-between">
          <span>25%</span>
        </div>
      ),
      key: 'zoomTo25',
      onClick: () => playound.config.updateZoom(0.25),
    },
    {
      type: 'divider',
    },
    {
      label: (
        <div className="flex items-center justify-between">
          <span>自适应视图</span>
          <span className="ml-8 text-gray-400">Ctrl 1</span>
        </div>
      ),
      key: 'fitView',
      onClick: () => tools.fitView(),
    },
  ];

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorder}`,
      }}
    >
      <Button
        type="text"
        size="small"
        icon={<ZoomOutOutlined />}
        onClick={() => tools.zoomout()}
        className="flex items-center justify-center"
        style={{ width: 24, height: 24, padding: 0 }}
      />

      <Dropdown trigger={['click']} menu={{ items }} placement="topLeft">
        <span className="cursor-pointer select-none text-sm font-medium px-2" style={{ color: token.colorText }}>
          {currentZoom}%
        </span>
      </Dropdown>

      <Button
        type="text"
        size="small"
        icon={<ZoomInOutlined />}
        onClick={() => tools.zoomin()}
        className="flex items-center justify-center"
        style={{ width: 24, height: 24, padding: 0 }}
      />
    </div>
  );
};

export default ZoomSelect;

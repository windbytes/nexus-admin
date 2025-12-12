import {
  CaretRightOutlined,
  CloseOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Divider, Dropdown, Input, Space, Tooltip } from 'antd';
import { useNodeRenderContext } from '../../hooks/useNodeRenderContext';
import { useNodeFormPanel } from '../../plugins/panel-manager-plugin/hooks';

/**
 * 统一侧边栏头部
 * @returns
 */
const SidebarHeader = () => {
  const { node, expanded, toggleExpand, readonly } = useNodeRenderContext();

  const { close: closePanel } = useNodeFormPanel();

  /**
   * 关闭侧边栏
   */
  const handleCLose = () => {
    closePanel();
  };

  return (
    <div
      className="flex items-center justify-between w-full overflow-hidden p-4"
      style={{ background: 'linear-gradient(rgb(242, 242, 255) 0%, rgb(251, 251, 251) 100%)' }}
    >
      <div className="whitespace-nowrap">图标</div>
      <Input
        classNames={{
          input: 'text-base font-semibold leading-6',
        }}
        name="node-name"
        defaultValue="节点名称"
        variant="borderless"
      />
      <Space size={4}>
        {readonly ? undefined : (
          <>
            <Tooltip title="运行此步骤" color="white">
              <Button type="text" icon={<CaretRightOutlined />} />
            </Tooltip>
            <Tooltip title="帮助文档" color="white">
              <Button type="text" icon={<QuestionCircleOutlined />} />
            </Tooltip>
            <Dropdown
              menu={{
                items: [
                  {
                    label: '删除',
                    key: 'delete',
                    icon: <DeleteOutlined />,
                  },
                ],
              }}
            >
              <Button type="text" icon={<EllipsisOutlined />} />
            </Dropdown>
            <Divider vertical />
          </>
        )}
        <Button type="text" icon={<CloseOutlined />} onClick={handleCLose} />
      </Space>
    </div>
  );
};

export default SidebarHeader;

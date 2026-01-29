import {
  CaretDownOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
  CloseOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Divider, Dropdown, Input, Space, Tooltip } from 'antd';
import { useNodeRenderContext } from '../../../context/use-node-render-context';
import { useIsSidebar } from '../../../hooks/useIsSidebar';
import { useNodeFormPanel } from '../../../plugins/panel-manager-plugin/hooks';

/**
 * 统一侧边栏头部
 * @returns
 */
const FormHeader = () => {
  const { node, expanded, toggleExpand, readonly } = useNodeRenderContext();
  const isSidebar = useIsSidebar();
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
        {node.renderData.expandable && !isSidebar && (
          <Button type="text" icon={expanded ? <CaretUpOutlined /> : <CaretDownOutlined />} onClick={toggleExpand} />
        )}
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
        {isSidebar && <Button type="text" icon={<CloseOutlined />} onClick={handleCLose} />}
      </Space>
    </div>
  );
};

export default FormHeader;

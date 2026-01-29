import {
  ExportOutlined,
  ImportOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { WorkflowNodeEntity, WorkflowPortEntity } from '@flowgram.ai/free-layout-editor';
import type { NodePanelRenderProps } from '@flowgram.ai/free-node-panel-plugin';
import { Divider, Popover } from 'antd';
import './index.scss';

/**
 * 节点列表组件属性
 */
interface NodeListProps {
  /** 选择节点回调 */
  onSelect: NodePanelRenderProps['onSelect'];
  /** 从哪个端口添加节点 */
  fromPort?: WorkflowPortEntity;
  // 容器节点
  containerNode?: WorkflowNodeEntity;
}

/**
 * 节点列表组件(需要进行添加的节点列表)
 * @param props 组件属性
 * @returns
 */
const NodeList: React.FC<NodeListProps> = ({ onSelect, fromPort, containerNode }) => {
  // props 暂未使用，预留给后续功能
  void onSelect;
  void fromPort;
  void containerNode;
  return (
    <>
      <Popover
        trigger={['hover']}
        content={<div>真实节点列表</div>}
        arrow={false}
        align={{
          offset: [-10, 0],
        }}
        placement="right"
      >
        <div className="node-item">
          <div>
            <PlusOutlined />
            <span className="ml-2">添加节点</span>
          </div>
        </div>
      </Popover>
      <div className="node-item">
        <div>
          <QuestionCircleOutlined />
          <span className="ml-2">添加注释</span>
        </div>
      </div>
      <div className="node-item">
        <div>
          <PlayCircleOutlined />
          <span className="ml-2">运行</span>
        </div>
      </div>
      <Divider style={{ margin: 0, height: '0.5px' }} />
      <div className="node-item">
        <div>
          <ImportOutlined />
          <span className="ml-2">导入DSL</span>
        </div>
      </div>
      <div className="node-item">
        <div>
          <ExportOutlined />
          <span className="ml-2">导出DSL</span>
        </div>
      </div>
    </>
  );
};

export default NodeList;

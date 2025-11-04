import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { Drawer } from 'antd';
import type React from 'react';

/**
 * 依赖关系图谱抽屉组件Props
 */
interface EndpointDependenciesDrawerProps {
  /** 是否显示 */
  open: boolean;
  /** 端点信息 */
  endpoint: Endpoint | null;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 依赖关系图谱抽屉组件
 */
const EndpointDependenciesDrawer: React.FC<EndpointDependenciesDrawerProps> = ({ open, endpoint, onClose }) => {
  return (
    <Drawer title="依赖关系图谱" open={open} width={1000} height={600} onClose={onClose}>
      <div>EndpointDependenciesDrawer</div>
    </Drawer>
  );
};

export default EndpointDependenciesDrawer;

import { Card, Divider, Drawer, Typography } from 'antd';
import type React from 'react';
import type { Endpoint } from '@/services/engine/endpoint/types';
import BasicInfoCard from './components/BasicInfoCard';
import ConfigInfoCard from './components/ConfigInfoCard';
import SystemInfoCard from './components/SystemInfoCard';
import TagsCard from './components/TagsCard';

const { Paragraph } = Typography;

interface EndpointDetailDrawerProps {
  /** 是否显示 */
  open: boolean;
  /** 端点信息 */
  endpoint: Endpoint | null;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 端点详情抽屉组件
 */
const EndpointDetailDrawer: React.FC<EndpointDetailDrawerProps> = ({ open, endpoint, onClose }) => {
  if (!endpoint) {
    return null;
  }

  return (
    <Drawer title="端点详情" placement="right" size={720} open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* 基础信息 */}
        <BasicInfoCard endpoint={endpoint} />

        {/* 配置信息 */}
        <ConfigInfoCard endpoint={endpoint} />

        {/* 标签信息 */}
        <TagsCard endpoint={endpoint} />

        {/* 备注信息 */}
        {endpoint.remark && (
          <Card title="备注" size="small">
            <Paragraph>{endpoint.remark}</Paragraph>
          </Card>
        )}

        <Divider />

        {/* 系统信息 */}
        <SystemInfoCard endpoint={endpoint} />
      </div>
    </Drawer>
  );
};

export default EndpointDetailDrawer;

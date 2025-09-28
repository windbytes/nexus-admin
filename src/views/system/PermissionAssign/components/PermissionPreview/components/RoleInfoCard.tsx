import { Card, Descriptions, Tag } from 'antd';
import { memo } from 'react';
import type React from 'react';
import type { RoleModel } from '@/services/system/role/type';

/**
 * 角色信息卡片组件Props
 */
interface RoleInfoCardProps {
  /** 角色信息 */
  roleInfo?: RoleModel | undefined;
}

/**
 * 角色信息卡片组件
 * 负责展示角色的基本信息
 */
const RoleInfoCard: React.FC<RoleInfoCardProps> = memo(({
  roleInfo,
}) => {
  return (
    <Card title="角色信息" size="small">
      <Descriptions column={2} size="small">
        <Descriptions.Item label="角色名称">
          <span className="font-medium">{roleInfo?.roleName || '-'}</span>
        </Descriptions.Item>
        <Descriptions.Item label="角色编码">
          <Tag color="blue">{roleInfo?.roleCode || '-'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={roleInfo?.status ? 'green' : 'red'}>{roleInfo?.status ? '启用' : '禁用'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="描述">{roleInfo?.remark || '-'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
});

RoleInfoCard.displayName = 'RoleInfoCard';

export default RoleInfoCard;

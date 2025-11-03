import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, theme } from 'antd';
import type React from 'react';
import { useMemo } from 'react';

interface EndpointStatisticsProps {
  /** 端点总数 */
  total: number;
  /** 启用的端点数 */
  enabled: number;
  /** 禁用的端点数 */
  disabled: number;
  /** 各类型端点统计 */
  typeStats?: Record<string, number>;
}

/**
 * 端点统计卡片组件
 */
const EndpointStatistics: React.FC<EndpointStatisticsProps> = ({ total, enabled, disabled, typeStats = {} }) => {
  const { token } = theme.useToken();

  /**
   * 计算活跃率
   */
  const activeRate = useMemo(() => {
    if (total === 0) return 0;
    return ((enabled / total) * 100).toFixed(1);
  }, [total, enabled]);

  return (
    <Row gutter={[16, 16]}>
      {/* 端点总数 */}
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless" className="hover:shadow-md transition-shadow">
          <Statistic
            title="端点总数"
            value={total}
            prefix={<ApiOutlined style={{ color: token.colorPrimary }} />}
            valueStyle={{ color: token.colorText }}
          />
        </Card>
      </Col>

      {/* 启用端点 */}
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless" className="hover:shadow-md transition-shadow">
          <Statistic
            title="启用端点"
            value={enabled}
            prefix={<CheckCircleOutlined style={{ color: token.colorSuccess }} />}
            valueStyle={{ color: token.colorSuccess }}
          />
        </Card>
      </Col>

      {/* 禁用端点 */}
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless" className="hover:shadow-md transition-shadow">
          <Statistic
            title="禁用端点"
            value={disabled}
            prefix={<CloseCircleOutlined style={{ color: token.colorError }} />}
            valueStyle={{ color: token.colorError }}
          />
        </Card>
      </Col>

      {/* 活跃率 */}
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless" className="hover:shadow-md transition-shadow">
          <Statistic
            title="活跃率"
            value={activeRate}
            suffix="%"
            prefix={<ThunderboltOutlined style={{ color: token.colorWarning }} />}
            valueStyle={{ color: token.colorWarning }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default EndpointStatistics;

import { Descriptions } from 'antd';
import type React from 'react';

/**
 * 项目描述
 * @returns
 */
const ProjectDescription: React.FC = () => {
  return (
    <>
      <h4 className="text-base font-semibold text-gray-800 mb-3">项目介绍</h4>
      <Descriptions column={1} size="small" bordered className="text-sm">
        <Descriptions.Item label="项目名称" span={1}>
          Nexus Platform 一体化平台
        </Descriptions.Item>
        <Descriptions.Item label="版本号" span={1}>
          v0.0.1
        </Descriptions.Item>
        <Descriptions.Item label="技术栈" span={1}>
          React + TypeScript + Ant Design + ECharts
        </Descriptions.Item>
        <Descriptions.Item label="主要功能" span={1}>
          流程设计、执行监控、数据分析、权限管理
        </Descriptions.Item>
        <Descriptions.Item label="适用场景" span={1}>
          企业级工作流管理、业务流程自动化、审批流程管理
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default ProjectDescription;

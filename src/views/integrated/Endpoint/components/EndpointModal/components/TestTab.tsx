import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import type React from 'react';
import CollapsibleCard from '../CollapsibleCard';
import type { UseTestTabReturn } from '../types';

const { TextArea } = Input;

interface TestTabProps {
  /** 测试 Tab Hook 返回值 */
  testTab: UseTestTabReturn;
}

/**
 * 测试 Tab 组件
 */
const TestTab: React.FC<TestTabProps> = ({ testTab }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* 头部 - 键值对输入 */}
      <CollapsibleCard title="请求头">
        <div className="flex flex-col gap-2">
          {testTab.headers.map((header) => (
            <Space key={header.id} style={{ width: '100%' }}>
              <Input
                placeholder="键"
                value={header.key}
                onChange={(e) => testTab.handleHeaderChange(header.id, 'key', e.target.value)}
                style={{ width: 200 }}
              />
              <Input
                placeholder="值"
                value={header.value}
                onChange={(e) => testTab.handleHeaderChange(header.id, 'value', e.target.value)}
                style={{ flex: 1 }}
              />
              {testTab.headers.length > 1 && (
                <Button danger size="small" onClick={() => testTab.handleRemoveHeader(header.id)}>
                  删除
                </Button>
              )}
            </Space>
          ))}
          <Button type="dashed" onClick={testTab.handleAddHeader} icon={<PlusOutlined />} style={{ width: '100%' }}>
            添加键值对
          </Button>
        </div>
      </CollapsibleCard>

      {/* 主体内容 */}
      <CollapsibleCard title="主体内容">
        <TextArea
          placeholder="请输入主体内容"
          rows={6}
          value={testTab.bodyContent}
          onChange={(e) => testTab.setBodyContent(e.target.value)}
        />
      </CollapsibleCard>

      {/* 请求内容 */}
      <CollapsibleCard title="请求内容">
        <TextArea
          placeholder="请输入请求内容"
          rows={6}
          value={testTab.requestContent}
          onChange={(e) => testTab.setRequestContent(e.target.value)}
        />
      </CollapsibleCard>

      {/* 响应内容 */}
      <CollapsibleCard title="响应内容">
        <TextArea
          placeholder="响应内容将显示在这里"
          rows={6}
          value={testTab.responseContent}
          onChange={(e) => testTab.setResponseContent(e.target.value)}
        />
      </CollapsibleCard>

      {/* 运行测试按钮 */}
      <Button type="primary" size="large" style={{ width: '100%' }}>
        运行测试
      </Button>
    </div>
  );
};

TestTab.displayName = 'TestTab';

export default TestTab;

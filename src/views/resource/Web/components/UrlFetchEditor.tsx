import type React from 'react';
import { memo } from 'react';
import { Form, Input, Button, App } from 'antd';
import { LinkOutlined, SyncOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { webServiceApi } from '@/services/resource/webservice/webServiceApi';

interface UrlFetchEditorProps {
  disabled: boolean;
  onWsdlFetched?: (wsdlContent: string) => void;
}

/**
 * URL获取编辑器组件
 */
const UrlFetchEditor: React.FC<UrlFetchEditorProps> = memo(({ disabled, onWsdlFetched }) => {
  const { message } = App.useApp();
  const form = Form.useFormInstance();

  // 从URL获取WSDL的mutation
  const fetchWsdlMutation = useMutation({
    mutationFn: async (url: string) => {
      return await webServiceApi.parseWsdlFromUrl(url);
    },
    onSuccess: (data) => {
      message.success('WSDL获取成功！');
      onWsdlFetched?.(data.wsdlContent);
    },
    onError: (error: any) => {
      message.error(`WSDL获取失败：${error.message}`);
    },
  });

  /**
   * 处理获取WSDL
   */
  const handleFetchWsdl = async () => {
    const wsdlUrl = form.getFieldValue('wsdlUrl');
    if (!wsdlUrl) {
      message.warning('请先输入WSDL URL！');
      return;
    }

    // 简单的URL格式验证
    try {
      new URL(wsdlUrl);
    } catch (e) {
      message.error('请输入有效的URL地址！');
      return;
    }

    fetchWsdlMutation.mutate(wsdlUrl);
  };

  return (
    <div className="py-4">
      <Form.Item
        name="wsdlUrl"
        label="WSDL URL"
        rules={[
          { required: true, message: '请输入WSDL URL' },
          { type: 'url', message: '请输入有效的URL地址' },
        ]}
      >
        <Input
          placeholder="例如：http://example.com/services/userService?wsdl"
          prefix={<LinkOutlined />}
          disabled={disabled}
        />
      </Form.Item>

      {!disabled && (
        <div className="flex justify-end mb-4">
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleFetchWsdl}
            loading={fetchWsdlMutation.isPending}
          >
            获取WSDL
          </Button>
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
        <div className="font-medium text-blue-700 mb-1">提示：</div>
        <ul className="list-disc list-inside space-y-1">
          <li>请确保URL可以正常访问</li>
          <li>URL应该指向有效的WSDL文档</li>
          <li>点击"获取WSDL"按钮从URL加载内容</li>
        </ul>
      </div>
    </div>
  );
});

UrlFetchEditor.displayName = 'UrlFetchEditor';

export default UrlFetchEditor;


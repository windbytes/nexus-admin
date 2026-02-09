import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { DICT_TYPE_OPTIONS } from '../../constants';

interface BasicInfoFormProps {
  disabled?: boolean;
}

/**
 * 字典基本信息表单项（编码、名称、类型、描述、启用、缓存等）
 */
const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ disabled }) => {
  return (
    <>
      <Form.Item label="字典编码" name="dictCode" rules={[{ required: true, message: '请输入字典编码' }]}>
        <Input placeholder="请输入字典编码" allowClear maxLength={100} disabled={disabled} />
      </Form.Item>
      <Form.Item label="字典名称" name="dictName" rules={[{ required: true, message: '请输入字典名称' }]}>
        <Input placeholder="请输入字典名称" allowClear maxLength={200} disabled={disabled} />
      </Form.Item>
      <Form.Item label="数据源类型" name="dictType" rules={[{ required: true, message: '请选择数据源类型' }]}>
        <Select
          placeholder="请选择数据源类型"
          options={DICT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item label="描述" name="description">
        <Input.TextArea placeholder="选填" rows={2} disabled={disabled} />
      </Form.Item>
      <Form.Item label="启用" name="enabled" valuePropName="checked" initialValue={true}>
        <Switch disabled={disabled} />
      </Form.Item>
      <Form.Item label="启用缓存" name="cacheEnabled" valuePropName="checked" initialValue={true}>
        <Switch disabled={disabled} />
      </Form.Item>
      <Form.Item label="缓存过期(秒)" name="cacheTtlSec" tooltip="不填表示不限制">
        <InputNumber placeholder="如 300" min={0} className="w-full" disabled={disabled} />
      </Form.Item>
    </>
  );
};

export default BasicInfoForm;

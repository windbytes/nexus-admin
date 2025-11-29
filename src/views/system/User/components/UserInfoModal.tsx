import DragModal from '@/components/modal/DragModal';
import { Form, Input, Select, DatePicker, Upload, message } from 'antd';
import { useEffect, useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import type { UserModel } from '@/services/system/user/type';

interface UserInfoModalProps {
  visible: boolean;
  action: string;
  onOk: (values: Partial<UserModel>) => void;
  onCancel: () => void;
  userInfo: Partial<UserModel> | null;
}

/**
 * 用户信息弹窗
 * @param visible 弹窗可见性
 * @param onOk 弹窗确认回调
 * @param onCancel 弹窗取消回调
 * @param userInfo 用户信息
 * @returns
 */
const UserInfoModal: React.FC<UserInfoModalProps> = ({ visible, onOk, onCancel, userInfo, action }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  // 初始化表单数据
  useEffect(() => {
    if (!visible) {
      return;
    }
    if (userInfo) {
      const formData = {
        ...userInfo,
        birthday: userInfo.birthday ? dayjs(userInfo.birthday) : undefined,
      };
      form.setFieldsValue(formData);
      setImageUrl(userInfo.avatar);
    } else {
      form.resetFields();
      setImageUrl(undefined);
    }
  }, [userInfo, form, visible]);

  /**
   * 确认回调
   */
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const submitData = {
          ...values,
          birthday: values.birthday?.format('YYYY-MM-DD'),
          avatar: imageUrl,
        };
        onOk(submitData);
      })
      .catch((errorInfo) => {
        // 滚动并聚焦到第一个错误字段
        form.scrollToField(errorInfo.errorFields[0].name);
        form.focusField(errorInfo.errorFields[0].name);
      });
  };

  /**
   * 取消回调
   */
  const handleCancel = () => {
    form.resetFields();
    setImageUrl(undefined);
    onCancel();
  };

  // 头像上传前的校验
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  // 头像上传变化处理
  const handleChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      setImageUrl(info.file.response.url);
    }
  };

  // 上传按钮
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传头像</div>
    </div>
  );

  return (
    <DragModal
      title={action === 'view' ? '用户详情' : action === 'add' ? '新增用户' : '编辑用户'}
      open={visible}
      onOk={handleOk}
      okButtonProps={{ disabled: action === 'view' }}
      onCancel={handleCancel}
      width={600}
    >
      <Form
        form={form}
        disabled={action === 'view'}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        validateMessages={{
          required: '${label}不能为空',
          types: {
            email: '请输入正确的邮箱格式',
          },
        }}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true }, { min: 3, message: '用户名至少3个字符' }]}
        >
          <Input placeholder="请输入用户名" autoFocus />
        </Form.Item>

        <Form.Item label="真实姓名" name="realName" rules={[{ required: true }]}>
          <Input placeholder="请输入真实姓名" />
        </Form.Item>

        <Form.Item label="头像" valuePropName="avatar">
          <Upload
            listType="picture-card"
            showUploadList={false}
            action="/api/upload"
            beforeUpload={beforeUpload}
            onChange={handleChange}
          >
            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
          </Upload>
        </Form.Item>

        <Form.Item label="性别" name="sex" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 1, label: '男' },
              { value: 2, label: '女' },
            ]}
          />
        </Form.Item>

        <Form.Item label="邮箱" name="email" rules={[{ required: true }, { type: 'email' }]}>
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item label="生日" name="birthday">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        {!userInfo && (
          <Form.Item label="密码" name="password" rules={[{ required: true }, { min: 8, message: '密码至少8个字符' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        )}

        <Form.Item label="状态" name="status" initialValue={1}>
          <Select
            options={[
              { value: 1, label: '正常' },
              { value: 0, label: '冻结' },
            ]}
          />
        </Form.Item>
      </Form>
    </DragModal>
  );
};

export default UserInfoModal;

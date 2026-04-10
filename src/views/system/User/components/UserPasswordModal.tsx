import { Col, Form, Input, type InputRef, Progress, Row } from 'antd';
import { keys, values } from 'lodash-es';
import type React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';
import type { UserModel } from '@/services/system/user/type';
import { strengthMeterOptions } from '../constants';
import { useUserActions } from '../hooks/useUserAction';
import styles from '../index.module.css';

interface UserPasswordModalProps {
  open: boolean;
  onClose: () => void;
  userInfo: Partial<UserModel> | null;
  onOk: () => void;
}

/**
 * 更新用户密码弹窗
 */
const UserPasswordModal: React.FC<UserPasswordModalProps> = ({ open, onClose, userInfo, onOk }) => {
  const { updateUserPassword } = useUserActions({ currentRow: userInfo, onSuccess: onOk });
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const passwordRef = useRef<InputRef>(null);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(userInfo);
    }
  }, [open]);

  // 监听密码改变
  const password = Form.useWatch('password', form);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }
    import('@zxcvbn-ts/core').then(({ zxcvbn }) => {
      // score得分只有0~4，且只有整数范围并没有小数
      setStrength((zxcvbn(password).score + 1) * 20);
    });
  }, [password]);

  const handleOk = () => {
    // 调用表单验证
    form
      .validateFields()
      .then((values) => {
        const { id, password } = values;
        updateUserPassword(id, password);
      })
      .catch((errorInfo) => {
        // 滚动并聚焦到第一个错误字段
        form.scrollToField(errorInfo.errorFields[0].name);
        form.focusField(errorInfo.errorFields[0].name);
      });
  };

  // 窗口打开后的回调
  const onAfterOpenChange = (open: boolean) => {
    if (open) {
      passwordRef.current?.focus();
    }
  };

  /**  * 取消回调
   */
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <DragModal
      title="更新用户密码"
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      afterOpenChange={onAfterOpenChange}
    >
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 19 }}>
        {/* 隐藏的用户ID */}
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true }, { min: 8, message: '密码至少8个字符' }]}>
          <Input.Password ref={passwordRef} />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirmPassword"
          rules={[
            { required: true },
            { min: 8, message: '密码至少8个字符' },
            {
              validator(_, value) {
                if (!value || form.getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致!'));
              },
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
      {/* 显示密码强度 */}
      <div className={styles['process-steps']}>
        <Progress percent={strength} steps={5} strokeColor={values(strengthMeterOptions)} showInfo={false} />
      </div>
      <Row justify="space-around" className={styles['process-steps']}>
        {keys(strengthMeterOptions).map((value: string) => (
          <Col span={4} key={value}>
            {t(`user.passowrd.${value}`)}
          </Col>
        ))}
      </Row>
    </DragModal>
  );
};

export default memo(UserPasswordModal);

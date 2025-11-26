import DragModal from '@/components/modal/DragModal';
import type { UserModel } from '@/services/system/user/type';
import { userService } from '@/services/system/user/userApi';
import { useMutation } from '@tanstack/react-query';
import { zxcvbn } from '@zxcvbn-ts/core';
import { App, Col, Form, Input, Progress, Row, type InputRef } from 'antd';
import { keys, values } from 'lodash-es';
import type React from 'react';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { strengthMeterOptions } from '../config';
import styles from '../strengthMeter.module.scss';

interface UserPasswordModalProps {
  open: boolean;
  onClose: () => void;
  userInfo: Partial<UserModel>;
  onOk: () => void;
}

/**
 * 更新用户密码弹窗
 */
const UserPasswordModal: React.FC<UserPasswordModalProps> = ({ open, onClose, userInfo, onOk }) => {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const passwordRef = useRef<InputRef>(null);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(userInfo);
    }
  }, [open]);

  // 监听密码改变
  const password = Form.useWatch('password', form);

  /**
   * 监听密码强度
   * @param password 密码
   */
  const watchStrength = (password: string) => {
    const analysisValue = zxcvbn(password);
    // score得分只有0~4，且只有整数范围并没有小数
    return (analysisValue.score + 1) * 20;
  };

  const handleOk = () => {
    // 调用表单验证
    form
      .validateFields()
      .then((values) => {
        const { id, password } = values;
        updatePassword.mutate({ id, password });
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

  // 更新用户密码
  const updatePassword = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => userService.changeUserPwd(id, password),
    onSuccess: () => {
      message.success('更新用户密码成功');
      onOk();
    },
    onError: (error) => {
      modal.error({
        title: '更新用户密码失败',
        content: error.message,
      });
    },
  });

  return (
    <DragModal title="更新用户密码" open={open} onCancel={onClose} onOk={handleOk} afterOpenChange={onAfterOpenChange}>
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
        <Progress
          percent={password ? watchStrength(password) : 0}
          steps={5}
          strokeColor={values(strengthMeterOptions)}
          showInfo={false}
        />
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

import type { InputRef } from 'antd';
import { Col, Form, Input, Radio, type RadioChangeEvent, Row, TreeSelect } from 'antd';
import type React from 'react';
import { MENU_TYPE, type MenuType } from '../../../constants';

interface BasicInfoFormProps {
  menuType: MenuType;
  nameRef: React.RefObject<InputRef | null>;
  directoryData: any[];
  isFetching: boolean;
  onMenuTypeChange: (e: RadioChangeEvent) => void;
}

/**
 * 基础信息表单组件
 */
const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  menuType,
  nameRef,
  directoryData,
  isFetching,
  onMenuTypeChange,
}) => {
  const TREE_SELECT_STYLES = { popup: { root: { maxHeight: 400, overflow: 'auto' } } };

  return (
    <Row gutter={16}>
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
      <Col span={12}>
        <Form.Item name="menuType" label="菜单类型" rules={[{ required: true, message: '请选择菜单类型!' }]}>
          <Radio.Group buttonStyle="solid" onChange={onMenuTypeChange}>
            <Radio.Button value={MENU_TYPE.SUB_MENU}>子菜单</Radio.Button>
            <Radio.Button value={MENU_TYPE.SUB_ROUTE}>子路由</Radio.Button>
            <Radio.Button value={MENU_TYPE.TOP_LEVEL}>目录</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="name"
          label={menuType === MENU_TYPE.PERMISSION_BUTTON ? '权限名称' : '菜单名称'}
          rules={[{ required: true, message: '菜单名称不能为空!' }]}
        >
          <Input autoFocus ref={nameRef} autoComplete="off" />
        </Form.Item>
      </Col>
      {menuType === MENU_TYPE.PERMISSION_BUTTON && (
        <Col span={12}>
          <Form.Item name="perms" label="权限标识" rules={[{ required: true, message: '权限标识不能为空！' }]}>
            <Input allowClear autoComplete="off" />
          </Form.Item>
        </Col>
      )}
      {menuType !== MENU_TYPE.TOP_LEVEL && (
        <Col span={12}>
          <Form.Item name="parentId" label="上级菜单" rules={[{ required: true, message: '请选择上级菜单!' }]}>
            <TreeSelect
              showSearch
              loading={isFetching}
              style={{ width: '100%' }}
              styles={TREE_SELECT_STYLES}
              placeholder="请选择上级目录"
              treeData={directoryData}
            />
          </Form.Item>
        </Col>
      )}
    </Row>
  );
};

BasicInfoForm.displayName = 'BasicInfoForm';

export default BasicInfoForm;

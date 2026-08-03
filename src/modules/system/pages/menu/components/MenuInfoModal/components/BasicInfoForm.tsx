import type { InputRef, RadioChangeEvent } from 'antd';
import { Col, Form, Input, Radio, Row, TreeSelect } from 'antd';
import type { RefObject } from 'react';
import { MENU_TYPE, type MenuType } from '../../../constants';

const TREE_SELECT_STYLES = { popup: { root: { maxHeight: 400, overflow: 'auto' } } };

interface BasicInfoFormProps {
  /** 当前选中的菜单类型，用于切换标签文案与字段显隐 */
  menuType: MenuType;
  /** 菜单名称输入框 ref，供打开弹窗后自动聚焦 */
  nameRef: RefObject<InputRef | null>;
  /** 上级菜单 TreeSelect 数据源 */
  directoryData: unknown[];
  /** 目录树加载中状态 */
  isFetching: boolean;
  /**
   * 菜单类型变更回调。
   * @param e - Radio 变更事件
   */
  onMenuTypeChange: (e: RadioChangeEvent) => void;
}

/**
 * 菜单基础信息表单区块（类型、名称、权限标识、上级菜单）。
 *
 * @param props - 类型、目录数据与变更回调
 * @returns 表单字段行
 */
function BasicInfoForm({ menuType, nameRef, directoryData, isFetching, onMenuTypeChange }: BasicInfoFormProps) {
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
          <Form.Item name="permCode" label="权限标识" rules={[{ required: true, message: '权限标识不能为空！' }]}>
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
              treeData={directoryData as never[]}
            />
          </Form.Item>
        </Col>
      )}
    </Row>
  );
}

export default BasicInfoForm;

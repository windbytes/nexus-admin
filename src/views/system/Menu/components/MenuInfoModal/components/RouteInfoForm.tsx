import { MinusCircleOutlined, PlusOutlined, QuestionCircleFilled, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Form, Input, InputNumber, Space, Switch, Tooltip } from 'antd';
import type React from 'react';
import OptimizedIconPanel from '@/components/IconPanel/optimized-icon-panel';
import { MENU_TYPE, type MenuType } from '../../../constants';

interface RouteInfoFormProps {
  menuType: MenuType;
  onIconSelect: (icon: string) => void;
  showRouteFields: boolean;
}

/**
 * 路由信息表单组件
 */
const RouteInfoForm: React.FC<RouteInfoFormProps> = ({ menuType, onIconSelect, showRouteFields }) => {
  const ICON_PANEL_CLASSNAMES = {
    root: 'w-[360px] h-[300px] bg-white overflow-y-auto p-2 shadow-xl',
  };

  return (
    <>
      <Form.Item
        name="url"
        label={
          <>
            <Tooltip className="mr-1" title="访问的路由地址，如为外链，则路由地址需要以`http(s)://开头`">
              <QuestionCircleFilled />
            </Tooltip>
            路由地址
          </>
        }
        rules={[
          {
            required: menuType === MENU_TYPE.SUB_MENU,
            message: '路径不能为空!',
          },
        ]}
      >
        <Input allowClear autoComplete="off" />
      </Form.Item>
      {menuType === MENU_TYPE.SUB_MENU ||
        (menuType === MENU_TYPE.SUB_ROUTE && (
          <>
            <Form.Item
              label="前端组件"
              rules={[
                {
                  required: true,
                  message: '前端组件配置不能为空!',
                },
              ]}
            >
              <Space.Compact className="w-full">
                <Space.Addon>views/</Space.Addon>
                <Form.Item name="component" noStyle>
                  <Input allowClear placeholder="请输入前端组件" autoComplete="off" />
                </Form.Item>
                <Space.Addon>/index.tsx</Space.Addon>
              </Space.Compact>
            </Form.Item>
            <Form.Item name="componentName" label="组件名称">
              <Input allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="redirect" label="默认跳转地址">
              <Input allowClear autoComplete="off" />
            </Form.Item>
          </>
        ))}
      <Form.Item label="菜单图标">
        <Space.Compact className="w-full">
          <Form.Item name="icon" noStyle>
            <Input allowClear placeholder="请选择菜单图标" autoComplete="off" />
          </Form.Item>
          <Dropdown
            trigger={['click']}
            placement="bottom"
            popupRender={() => <OptimizedIconPanel onSelect={onIconSelect} />}
            classNames={ICON_PANEL_CLASSNAMES}
          >
            <Button icon={<SettingOutlined className="cursor-pointer" />} />
          </Dropdown>
        </Space.Compact>
      </Form.Item>
      <Form.Item name="sortNo" label="排序">
        <InputNumber min={0} autoComplete="off" mode="spinner" />
      </Form.Item>

      {/* 添加路由参数配置项目 */}
      {(menuType === MENU_TYPE.SUB_MENU || menuType === MENU_TYPE.SUB_ROUTE) && showRouteFields && (
        <>
          <Form.Item label="路由参数">
            <Form.List name="routeQuery">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex' }} align="baseline">
                      <Form.Item {...restField} name={[name, 'key']} colon={false}>
                        <Input placeholder="key" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'value']}>
                        <Input placeholder="value" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(key)} />
                    </Space>
                  ))}
                  <Form.Item colon={false}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加路由参数
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="route" label="是否路由菜单">
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              defaultChecked
              disabled={menuType === MENU_TYPE.SUB_ROUTE}
            />
          </Form.Item>
        </>
      )}
      {menuType !== MENU_TYPE.PERMISSION_BUTTON && (
        <Form.Item name="hidden" label="隐藏路由">
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>
      )}
      {menuType === MENU_TYPE.SUB_MENU && (
        <>
          <Form.Item name="keepAlive" label="路由缓存">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Form.Item
            name="internalOrExternal"
            label={
              <>
                <Tooltip className="mr-1" title="选择是外链，则路由地址需要以`http(s)://开头`">
                  <QuestionCircleFilled />
                </Tooltip>
                打开方式
              </>
            }
          >
            <Switch checkedChildren="外部" unCheckedChildren="内部" />
          </Form.Item>
        </>
      )}
    </>
  );
};

RouteInfoForm.displayName = 'RouteInfoForm';

export default RouteInfoForm;

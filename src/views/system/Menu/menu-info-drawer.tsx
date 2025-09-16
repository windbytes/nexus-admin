import {
  CloseOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  QuestionCircleFilled,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
  Switch,
  Tooltip,
  TreeSelect,
  type InputRef,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OptimizedIconPanel from '@/components/IconPanel/optimized-icon-panel';
import { menuService } from '@/services/system/menu/menuApi';
import { addIcon } from '@/utils/optimized-icons';

// 菜单类型枚举
const MenuType = {
  TOP_LEVEL: 0,
  SUB_MENU: 1,
  SUB_ROUTE: 2,
  PERMISSION_BUTTON: 3,
} as const;
type MenuType = (typeof MenuType)[keyof typeof MenuType];

// 菜单数据类型
export interface MenuData {
  id?: string | number;
  menuType: MenuType;
  name: string;
  parentId?: string | number;
  url?: string;
  component?: string;
  componentName?: string;
  redirect?: string;
  icon?: string;
  routeQuery?: string;
  sortNo?: number;
  route?: boolean;
  hidden?: boolean;
  // 路由缓存
  keepAlive?: boolean;
  internalOrExternal?: boolean;
  status: boolean;
  perms?: string;
}

/**
 * 菜单信息抽屉
 * @param open 是否打开
 * @param operation 操作
 * @param onClose 关闭抽屉
 * @param menu 当前选中的菜单
 * @param onOk 点击确定
 * @returns 菜单信息抽屉
 */
const MenuInfoDrawer: React.FC<MenuInfoDrawerProps> = ({ open, operation, onClose, menu, copiedMenuData, onOk }) => {
  const [form] = Form.useForm();
  const nameRef = useRef<InputRef>(null);
  const [menuType, setMenuType] = useState<MenuType>(MenuType.SUB_MENU);
  const { t } = useTranslation();

  // 初始化表单数据
  useEffect(() => {
    if (!open) {
      return;
    }

    if (operation === 'add' && copiedMenuData) {
      // 如果是新增操作且有复制的数据，使用复制的数据
      form.setFieldsValue(copiedMenuData);
      setMenuType(copiedMenuData.menuType);
    } else if (menu && operation !== 'add') {
      // 如果是编辑操作，使用当前菜单数据
      form.setFieldsValue(menu);
      setMenuType(menu.menuType);
    } else {
      // 普通新增操作，重置表单
      form.resetFields();
      setMenuType(MenuType.SUB_MENU);
    }
  }, [menu, copiedMenuData, operation, form, open]);

  // 递归处理目录数据，对 title 进行国际化
  const translateDirectory = useCallback(
    (data: any[], typeFilter?: MenuType): any[] => {
      const loop = (items: any[]): any[] =>
        items
          .filter((item) => {
            // 如果传入了类型过滤，则只保留匹配类型的项
            return typeFilter === MenuType.PERMISSION_BUTTON
              ? item.menuType !== MenuType.PERMISSION_BUTTON
              : item.menuType === typeFilter;
          })
          .map((item) => {
            const iconNode = item.icon ? addIcon(item.icon) : null;

            const newItem: any = {
              ...item,
              selectable:
                menuType !== MenuType.PERMISSION_BUTTON || !Array.isArray(item.children) || item.children.length === 0,
              title: (
                <Space>
                  {iconNode}
                  {t(item.title)}
                </Space>
              ),
            };

            if (Array.isArray(item.children) && item.children.length > 0) {
              newItem.children = loop(item.children);
            }

            return newItem;
          });

      return loop(data);
    },
    [t, menuType],
  );

  // 使用 useQuery 获取目录数据
  const { data: allDirectoryData, isLoading } = useQuery({
    queryKey: ['sys_menu_directory'],
    queryFn: async () => {
      return await menuService.getDirectory();
    },
    enabled: open,
  });

  // 根据当前菜单类型进行过滤并国际化
  const directoryData = useMemo(() => {
    return translateDirectory(
      allDirectoryData || [],
      menuType === MenuType.SUB_MENU || menuType === MenuType.SUB_ROUTE ? MenuType.TOP_LEVEL : menuType,
    );
  }, [allDirectoryData, menuType, translateDirectory]);

  /**
   * 提交表单
   */
  const onSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const formData: MenuData = {
        ...values,
        status: Boolean(values.status),
        icon: values.originalIcon,
        routeQuery: values.routeQuery ? values.routeQuery : {},
      };
      onOk(formData);
    } catch (errorInfo: any) {
      const firstErrorField = errorInfo.errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField);
        form.focusField(firstErrorField);
      }
    }
  }, [form, onOk]);

  // 处理菜单类型变更
  const handleMenuTypeChange = useCallback(
    (value: MenuType) => {
      setMenuType(value);
      requestAnimationFrame(() => {
        if (value === MenuType.SUB_ROUTE) {
          form.setFieldsValue({ route: true });
        }
        nameRef.current?.focus();
      });
    },
    [form, nameRef],
  );

  // 选择图标
  const handleIconSelect = useCallback((icon: string) => {
    if (icon) {
      form.setFieldsValue({ icon });
    }
  }, []);

  // 弹窗打开后的处理
  const handleAfterOpenChange = useCallback((open: boolean) => {
    if (open) {
      nameRef.current?.focus();
    }
  }, []);

  // 根据菜单类型判断是否显示路由相关字段
  const showRouteFields = useMemo(() => menuType !== MenuType.PERMISSION_BUTTON, [menuType]);

  // 表单初始值
  const initialFormValues = useMemo(() => {
    return {
      menuType: MenuType.SUB_MENU,
      route: false,
      hidden: false,
      internalOrExternal: false,
      status: true,
      parentId: menu?.id,
    };
  }, [menu]);

  return (
    <Drawer
      title={`${menu ? '编辑' : '新增'}菜单`}
      open={open}
      width={800}
      onClose={() => onClose(false, 'view')}
      classNames={{ footer: 'flex justify-end' }}
      closeIcon={false}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={() => onClose(false, 'view')} />}
      afterOpenChange={handleAfterOpenChange}
      footer={
        <Space>
          <Button type="default" onClick={() => onClose(false, 'view')}>
            取消
          </Button>
          <Button type="primary" onClick={onSubmit}>
            确定
          </Button>
        </Space>
      }
    >
      <Form form={form} initialValues={initialFormValues} labelCol={{ span: 4 }}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="menuType" label="菜单类型" rules={[{ required: true, message: '请选择菜单类型!' }]}>
          <Radio.Group buttonStyle="solid" onChange={(e) => handleMenuTypeChange(e.target.value)}>
            <Radio.Button value={MenuType.SUB_MENU}>子菜单</Radio.Button>
            <Radio.Button value={MenuType.SUB_ROUTE}>子路由</Radio.Button>
            {/* <Radio.Button value={MenuType.PERMISSION_BUTTON}>权限按钮</Radio.Button> */}
            <Radio.Button value={MenuType.TOP_LEVEL}>目录</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="name"
          label={menuType === MenuType.PERMISSION_BUTTON ? '权限名称' : '菜单名称'}
          rules={[{ required: true, message: '菜单名称不能为空!' }]}
        >
          <Input autoFocus ref={nameRef} autoComplete="off" />
        </Form.Item>
        {menuType === MenuType.PERMISSION_BUTTON && (
          <Form.Item name="perms" label="权限标识" rules={[{ required: true, message: '权限标识不能为空！' }]}>
            <Input allowClear autoComplete="off" />
          </Form.Item>
        )}
        {menuType !== MenuType.TOP_LEVEL && (
          <Form.Item name="parentId" label="上级菜单" rules={[{ required: true, message: '请选择上级菜单!' }]}>
            <TreeSelect
              showSearch
              loading={isLoading}
              style={{ width: '100%' }}
              styles={{ popup: { root: { maxHeight: 400, overflow: 'auto' } } }}
              placeholder="请选择上级目录"
              treeData={directoryData}
            />
          </Form.Item>
        )}
        {showRouteFields && (
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
                  required: menuType === MenuType.SUB_MENU,
                  message: '路径不能为空!',
                },
              ]}
            >
              <Input allowClear autoComplete="off" />
            </Form.Item>
            {menuType === MenuType.SUB_MENU && (
              <>
                <Form.Item
                  name="component"
                  label="前端组件"
                  rules={[
                    {
                      required: menuType === MenuType.SUB_MENU,
                      message: '前端组件配置不能为空!',
                    },
                  ]}
                >
                  <Input allowClear placeholder="请输入前端组件" addonBefore="views/" addonAfter="/index.tsx" autoComplete="off" />
                </Form.Item>
                <Form.Item name="componentName" label="组件名称">
                  <Input allowClear autoComplete="off" />
                </Form.Item>
                <Form.Item name="redirect" label="默认跳转地址">
                  <Input allowClear autoComplete="off" />
                </Form.Item>
              </>
            )}
            <Form.Item name="originalIcon" label="菜单图标">
              <Input
                allowClear
                placeholder="请选择菜单图标"
                autoComplete="off"
                addonAfter={
                  <Dropdown
                    trigger={['click']}
                    placement="bottom"
                    popupRender={() => <OptimizedIconPanel onSelect={handleIconSelect} />}
                    overlayClassName="w-[360px] h-[300px] bg-white overflow-y-auto p-2 shadow-xl"
                  >
                    <SettingOutlined className="cursor-pointer" />
                  </Dropdown>
                }
              />
            </Form.Item>
          </>
        )}
        <Form.Item name="sortNo" label="排序">
          <InputNumber min={0} autoComplete="off" />
        </Form.Item>

        {/* 添加路由参数配置项目 */}
        {(menuType === MenuType.SUB_MENU || menuType === MenuType.SUB_ROUTE) && (
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
                disabled={menuType === MenuType.SUB_ROUTE}
              />
            </Form.Item>
          </>
        )}
        {menuType !== MenuType.PERMISSION_BUTTON && (
          <Form.Item name="hidden" label="隐藏路由">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        )}
        {menuType === MenuType.SUB_MENU && (
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
        <Form.Item name="status" label="状态">
          <Switch checkedChildren="正常" unCheckedChildren="停用" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default MenuInfoDrawer;

export type MenuInfoDrawerProps = {
  open: boolean;
  // 操作
  operation: string;
  onClose: (open: boolean, operation: string) => void;
  /**
   * 当前选中的菜单
   */
  menu?: MenuData;
  /**
   * 复制的菜单数据（用于复制功能）
   */
  copiedMenuData?: MenuData;

  /**
   * 点击确定
   */
  onOk: (menu: MenuData) => void;
};

import { CloseOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Drawer, Form, type InputRef, type RadioChangeEvent, Space, Switch } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { menuService } from '@/services/system/menu/menuApi';
import type { MenuModel } from '@/services/system/menu/type';
import { addIcon } from '@/utils/optimized-icons';
import { MENU_TYPE, type MenuType } from '../../constants';
import BasicInfoForm from './components/BasicInfoForm';
import RouteInfoForm from './components/RouteInfoForm';

// 目录项接口
interface DirectoryItem {
  id: string;
  title: string;
  icon?: string;
  children?: DirectoryItem[];
  menuType: number;
  [key: string]: any;
}

// 菜单数据类型
export interface MenuData {
  id?: string;
  menuType: MenuType;
  name: string;
  parentId?: string;
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

export type MenuInfoDrawerProps = {
  open: boolean;
  // 操作
  operation: string;
  onClose: () => void;
  /**
   * 当前选中的菜单
   */
  menu?: Partial<MenuModel>;
  /**
   * 复制的菜单数据（用于复制功能）
   */
  copiedMenuData?: Partial<MenuModel>;

  /**
   * 点击确定
   */
  onOk: (menu: Partial<MenuModel>) => void;
};

// 静态样式对象，避免重复创建
const DRAWER_CLASSNAMES = { footer: 'flex justify-end' };

/**
 * 菜单信息抽屉
 */
const MenuInfoDrawer: React.FC<MenuInfoDrawerProps> = ({ open, operation, onClose, menu, copiedMenuData, onOk }) => {
  const [form] = Form.useForm();
  const nameRef = useRef<InputRef | null>(null);
  const { t } = useTranslation();
  const menuType = Form.useWatch('menuType', form);

  // 初始化表单数据
  useEffect(() => {
    if (!open) {
      return;
    }

    if (operation === 'add' && copiedMenuData) {
      // 如果是新增操作且有复制的数据，使用复制的数据
      form.setFieldsValue(copiedMenuData);
    } else if (menu && operation !== 'add') {
      // 如果是编辑操作，使用当前菜单数据
      form.setFieldsValue(menu);
    } else {
      // 普通新增操作
      form.setFieldsValue({
        menuType: MENU_TYPE.SUB_MENU,
        route: false,
        hidden: false,
        internalOrExternal: false,
        status: true,
        parentId: menu?.id,
      });
    }
  }, [open]);

  // 递归处理目录数据，对 title 进行国际化
  const translateDirectory = useCallback(
    (data: DirectoryItem[], filterFn?: (item: DirectoryItem) => boolean): any[] => {
      const loop = (items: DirectoryItem[]): any[] =>
        items
          .map((item) => {
            const shouldKeep = filterFn ? filterFn(item) : true;

            if (!shouldKeep) {
              return null;
            }

            const iconNode = item.icon ? addIcon(item.icon) : null;
            const children = Array.isArray(item.children) ? loop(item.children) : [];

            const newItem: any = {
              key: item.id,
              value: item.id,
              selectable: menuType !== MENU_TYPE.PERMISSION_BUTTON || !Array.isArray(children) || children.length === 0,
              title: (
                <Space>
                  {iconNode}
                  {t(item.title)}
                </Space>
              ),
            };

            if (children.length > 0) {
              newItem.children = children;
            }

            return newItem;
          })
          .filter((item): item is any => Boolean(item));

      return loop(data);
    },
    [menuType]
  );

  // 使用 useQuery 获取目录数据
  const { data: allDirectoryData, isFetching } = useQuery({
    queryKey: ['sys_menu_directory'],
    queryFn: async () => {
      return await menuService.getDirectory();
    },
    enabled: open,
  });

  // 根据当前菜单类型进行过滤并国际化
  const directoryFilter = useCallback(
    (item: DirectoryItem) => {
      if (menuType === MENU_TYPE.PERMISSION_BUTTON) {
        return item.menuType !== MENU_TYPE.PERMISSION_BUTTON;
      }

      return item.menuType === MENU_TYPE.TOP_LEVEL || item.menuType === MENU_TYPE.SUB_MENU;
    },
    [menuType]
  );

  const directoryData = useMemo(() => {
    // 确保 allDirectoryData 符合 DirectoryItem[] 类型，这里假设 API 返回符合预期
    return open ? translateDirectory((allDirectoryData as unknown as DirectoryItem[]) || [], directoryFilter) : [];
  }, [allDirectoryData, translateDirectory, directoryFilter, open]);

  /**
   * 提交表单
   */
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: Partial<MenuModel> = {
        ...values,
        status: Boolean(values.status),
        icon: values.originalIcon,
        routeQuery: values.routeQuery ? values.routeQuery : [],
      };
      onOk(formData);
    } catch (errorInfo) {
      // 安全处理 errorInfo
      const firstErrorField = (errorInfo as any).errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField);
        form.focusField(firstErrorField);
      }
    }
  };

  // 处理菜单类型变更
  const handleMenuTypeChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    form.setFieldsValue({ menuType: value });
    requestAnimationFrame(() => {
      if (value === MENU_TYPE.SUB_ROUTE) {
        form.setFieldsValue({ route: true });
      }
      nameRef.current?.focus();
    });
  };

  // 选择图标
  const handleIconSelect = (icon: string) => {
    if (icon) {
      form.setFieldsValue({ originalIcon: icon });
    }
  };

  // 弹窗打开后的处理
  const handleAfterOpenChange = (open: boolean) => {
    if (open) {
      nameRef.current?.focus();
    } else {
      form.resetFields();
    }
  };

  // 根据菜单类型判断是否显示路由相关字段
  const showRouteFields = useMemo(() => menuType !== MENU_TYPE.PERMISSION_BUTTON, [menuType]);

  // 关闭处理
  const handleClose = () => onClose();

  return (
    <Drawer
      title={`${menu ? '编辑' : '新增'}菜单`}
      open={open}
      size={800}
      onClose={handleClose}
      classNames={DRAWER_CLASSNAMES}
      closeIcon={false}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={handleClose} />}
      afterOpenChange={handleAfterOpenChange}
      footer={
        <Space>
          <Button type="default" onClick={handleClose}>
            取消
          </Button>
          <Button type="primary" onClick={onSubmit}>
            确定
          </Button>
        </Space>
      }
    >
      <Form form={form} labelCol={{ span: 4 }}>
        <BasicInfoForm
          menuType={menuType}
          nameRef={nameRef}
          directoryData={directoryData}
          isFetching={isFetching}
          onMenuTypeChange={handleMenuTypeChange}
        />
        {showRouteFields && <RouteInfoForm menuType={menuType} onIconSelect={handleIconSelect} />}
        <Form.Item name="status" label="状态">
          <Switch checkedChildren="正常" unCheckedChildren="停用" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default MenuInfoDrawer;

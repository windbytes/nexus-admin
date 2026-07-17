import { useQuery } from '@tanstack/react-query';
import { Button, Col, Form, type InputRef, type RadioChangeEvent, Row, Space, Switch } from 'antd';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { menuService } from '@/modules/system/api/menu';
import type { MenuModel } from '@/shared/api/system/menu/type';
import DragModal from '@/shared/components/modal/DragModal';
import { addIcon } from '@/shared/utils/optimized-icons';
import { MENU_TYPE, type MenuType } from '../../constants';
import BasicInfoForm from './components/BasicInfoForm';
import RouteInfoForm from './components/RouteInfoForm';

interface DirectoryItem {
  id: string;
  title: string;
  icon?: string;
  children?: DirectoryItem[];
  menuType: number;
  [key: string]: unknown;
}

export type MenuInfoDrawerProps = {
  /** 是否显示弹窗 */
  open: boolean;
  /** 操作模式：`add` | `edit` | `view` */
  operation: string;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /**
   * 当前关联菜单：
   * - 编辑/查看：完整行数据
   * - 新增：可选父菜单（用于预填 parentId）
   */
  menu?: Partial<MenuModel>;
  /** 复制功能产生的预填字段 */
  copiedMenuData?: Partial<MenuModel>;
  /**
   * 点击确定且校验通过后回调。
   * @param menu - 表单组装后的菜单字段
   */
  onOk: (menu: Partial<MenuModel>) => void;
};

/**
 * 菜单新增 / 编辑 / 查看弹窗（可拖拽）。
 *
 * @param props - 弹窗开关、操作类型、初始数据与提交回调
 * @returns DragModal + 表单
 */
function MenuInfoModal({ open, operation, onClose, menu, copiedMenuData, onOk }: MenuInfoDrawerProps) {
  const [form] = Form.useForm();
  const nameRef = useRef<InputRef | null>(null);
  const { t } = useTranslation();
  const menuType = Form.useWatch('menuType', form) as MenuType;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (operation === 'add' && copiedMenuData) {
      form.setFieldsValue(copiedMenuData);
    } else if (menu && operation !== 'add') {
      form.setFieldsValue(menu);
    } else {
      form.setFieldsValue({
        menuType: MENU_TYPE.SUB_MENU,
        route: false,
        hidden: false,
        internalOrExternal: false,
        status: true,
        parentId: menu?.id,
      });
    }
  }, [open, operation, menu, copiedMenuData, form]);

  /**
   * 将目录接口数据转为 TreeSelect 可用结构，并对 title 做 i18n。
   *
   * @param data - 原始目录节点
   * @param filterFn - 可选节点过滤器；返回 false 则丢弃该节点
   * @returns TreeSelect `treeData`
   */
  function translateDirectory(
    data: DirectoryItem[],
    filterFn?: (item: DirectoryItem) => boolean
  ): Record<string, unknown>[] {
    function loop(items: DirectoryItem[]): Record<string, unknown>[] {
      return items
        .map((item) => {
          const shouldKeep = filterFn ? filterFn(item) : true;
          if (!shouldKeep) {
            return null;
          }

          const iconNode = item.icon ? addIcon(item.icon) : null;
          const children = Array.isArray(item.children) ? loop(item.children) : [];

          const newItem: Record<string, unknown> = {
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
            newItem['children'] = children;
          }

          return newItem;
        })
        .filter((item): item is Record<string, unknown> => Boolean(item));
    }

    return loop(data);
  }

  const { data: allDirectoryData, isFetching } = useQuery({
    queryKey: ['sys_menu_directory'],
    queryFn: async () => menuService.getDirectory(),
    enabled: open,
  });

  /**
   * 按当前菜单类型过滤可选上级。
   * @param item - 目录节点
   * @returns 是否保留
   */
  function directoryFilter(item: DirectoryItem) {
    if (menuType === MENU_TYPE.PERMISSION_BUTTON) {
      return item.menuType !== MENU_TYPE.PERMISSION_BUTTON;
    }
    return item.menuType === MENU_TYPE.TOP_LEVEL || item.menuType === MENU_TYPE.SUB_MENU;
  }

  const directoryData = open
    ? translateDirectory((allDirectoryData as unknown as DirectoryItem[]) || [], directoryFilter)
    : [];

  /**
   * 校验并提交表单。
   * @returns Promise；校验失败时聚焦首个错误字段
   */
  async function onSubmit() {
    try {
      const values = await form.validateFields();
      const formData: Partial<MenuModel> = {
        ...values,
        status: Boolean(values.status),
        leaf: values.route,
        routeQuery: values.routeQuery ? values.routeQuery : [],
      };
      onOk(formData);
    } catch (errorInfo) {
      const firstErrorField = (errorInfo as { errorFields?: Array<{ name: string[] }> }).errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField);
        form.focusField(firstErrorField);
      }
    }
  }

  /**
   * 菜单类型 Radio 变更：子路由时强制 `route=true`。
   * @param e - antd Radio 变更事件
   */
  function handleMenuTypeChange(e: RadioChangeEvent) {
    const value = e.target.value;
    form.setFieldsValue({ menuType: value });
    requestAnimationFrame(() => {
      if (value === MENU_TYPE.SUB_ROUTE) {
        form.setFieldsValue({ route: true });
      }
      nameRef.current?.focus();
    });
  }

  /**
   * 图标面板选中回调，写入表单 `icon` 字段。
   * @param icon - 图标组件名
   */
  function handleIconSelect(icon: string) {
    if (icon) {
      form.setFieldsValue({ icon });
    }
  }

  /**
   * 弹窗打开后聚焦名称输入；关闭时重置表单。
   * @param isOpen - 是否已打开
   */
  function handleAfterOpenChange(isOpen: boolean) {
    if (isOpen) {
      nameRef.current?.focus();
    } else {
      form.resetFields();
    }
  }

  const showRouteFields = menuType !== MENU_TYPE.PERMISSION_BUTTON;
  const isViewMode = operation === 'view';

  return (
    <DragModal
      title={isViewMode ? '查看菜单' : operation === 'edit' ? '编辑菜单' : '新增菜单'}
      open={open}
      width={800}
      centered
      onCancel={onClose}
      afterOpenChange={handleAfterOpenChange}
      destroyOnHidden
      footer={
        isViewMode ? (
          <Space>
            <Button type="default" onClick={onClose}>
              关闭
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="default" onClick={onClose}>
              取消
            </Button>
            <Button type="primary" onClick={onSubmit}>
              确定
            </Button>
          </Space>
        )
      }
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          paddingRight: '8px',
        },
      }}
    >
      <Form form={form} labelCol={{ span: 8 }} disabled={isViewMode}>
        <BasicInfoForm
          menuType={menuType}
          nameRef={nameRef}
          directoryData={directoryData}
          isFetching={isFetching}
          onMenuTypeChange={handleMenuTypeChange}
        />
        <RouteInfoForm menuType={menuType} onIconSelect={handleIconSelect} showRouteFields={showRouteFields} />
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="status" label="状态">
              <Switch checkedChildren="正常" unCheckedChildren="停用" disabled={isViewMode} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </DragModal>
  );
}

export default MenuInfoModal;

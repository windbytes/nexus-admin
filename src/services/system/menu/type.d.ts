export interface MenuModel {
  /**
   * 菜单ID
   */
  id: string;
  /**
   * 菜单名称
   */
  name: string;

  /**
   * 上级菜单
   */
  parentId: string;

  /**
   * 上级菜单名称
   */
  parentName: string;

  /**
   * url
   */
  url: string;

  /**
   * 组件
   */
  component: string;

  /**
   * 组件名
   */
  componentName: string;

  /**
   * 跳转
   */
  redirect: string;

  /**
   * 菜单类型
   */
  menuType: number;

  /**
   * 权限
   */
  perms: string;

  /**
   * 权限类型
   */
  permsType: number;

  /**
   * 排序
   */
  sortNo: number;

  /**
   * 是否隐藏
   */
  hidden: boolean;

  /**
   * 图标
   */
  icon: string;

  /**
   * 是路由
   */
  route: boolean;

  /**
   * 路由参数
   */
  routeQuery: Array<{
    key: string;
    value: string;
  }>;

  /**
   * 是叶子节点
   */
  leaf: boolean;

  /**
   * 缓存
   */
  keepAlive: boolean;

  /**
   * 隐藏tab
   */
  hideTab: boolean;

  /**
   * 描述
   */
  description: string;

  /**
   * 删除标记
   */
  delFlag: number;

  /**
   * 规则标记
   */
  ruleFlag: number;

  /**
   * 状态
   */
  status: boolean;

  /**
   * 是否外链
   */
  target: boolean;

  /**
   * 创建者
   */
  createBy: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 更新者
   */
  updateBy: string;

  /**
   * 更新时间
   */
  updateTime: string;

  /**
   * 子菜单
   */
  children?: MenuModel[];
}

/**
 * 菜单目录项
 */
export interface MenuDirectoryItem {
  id: string | number;
  name: string;
  children?: MenuDirectoryItem[];
  [key: string]: any;
}

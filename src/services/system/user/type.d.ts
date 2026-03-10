import type { PageQueryParams } from '@/types/global';

/**
 * 用户模型
 */
export interface UserModel {
  /**
   * 用户ID
   */
  id: string;

  /**
   * 用户名
   */
  username: string;

  /**
   * 真实姓名
   */
  realName: string;

  /**
   * 用户头像
   */
  avatar: string;

  /**
   * 电子邮件
   */
  email: string;

  /**
   * 电话号码
   */
  phone: string;

  /**
   * 性别
   */
  sex: number;

  /**
   * 状态
   */
  status: number;

  /**
   * 删除标志
   */
  delFlag: string;

  /**
   * 创建者
   */
  createBy: string;

  /**
   * 生日
   */
  birthday: string;

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
   * 角色ID
   */
  roleId: string;

  /**
   * 角色名称
   */
  roleName: string;
}

/**
 * 分配用户抽屉模块查询参数
 */
export interface UserSearchParams extends PageQueryParams {
  username?: string;
  realName?: string;
  status?: 0 | 1;
}

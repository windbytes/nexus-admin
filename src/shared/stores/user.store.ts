import { create } from 'zustand';
import { type PersistOptions, persist } from 'zustand/middleware';
import type { RoleModel } from '@/shared/api/system/role/type';

// 定义用户信息的store
interface UserState {
  // 登录用户名
  loginUser: string;
  isLogin: boolean;
  homePath: string;
  // 访问token
  accessToken: string;
  // 当前角色ID
  roleId: string;
  // 当前角色Code
  roleCode: string;
  // 用户角色列表
  userRoles: RoleModel[];
  login: (loginUser: string, roleId: string, roleCode: string, accessToken: string) => void;
  clear(): void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setHomePath: (homePath: string) => void;
  setRoleId: (roleId: string) => void;
  setUserRoles: (roles: RoleModel[]) => void;
  switchRole: (roleId: string) => void;
}

// 创建用户信息的store
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      loginUser: '',
      isLogin: false,
      homePath: '/home',
      accessToken: '',
      roleId: '',
      roleCode: '',
      roleName: '',
      email: '',
      currentRoleId: '',
      userRoles: [],
      login: (loginUser = '', roleId = '', roleCode = '', accessToken = '') =>
        set({ loginUser, isLogin: true, roleId, roleCode, accessToken }),
      clear: () =>
        set({
          loginUser: '',
          isLogin: false,
          accessToken: '',
          roleId: '',
          roleCode: '',
          userRoles: [],
        }),
      logout: () =>
        set({
          loginUser: '',
          isLogin: false,
          accessToken: '',
          roleId: '',
          roleCode: '',
          userRoles: [],
        }),
      setAccessToken: (token: string) => set({ accessToken: token }),
      setHomePath: (homePath: string) => set({ homePath }),
      setRoleId: (roleId: string) => set({ roleId: roleId }),
      setUserRoles: (roles: RoleModel[]) => set({ userRoles: roles }),
      switchRole: (roleId: string) => {
        set((state) => {
          const newRole = state.userRoles.find((role) => role.id === roleId);
          if (newRole) {
            state.roleCode = newRole.roleCode;
            state.roleId = roleId;
          }
          return state;
        });
      },
    }),
    {
      name: 'user-storage', // 保存到 localStorage 的 key
      getStorage: () => localStorage,
    } as PersistOptions<UserState> // 类型定义
  )
);

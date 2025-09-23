import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import type { RoleModel } from '@/services/system/role/type';

// 定义用户信息的store
interface UserState {
  loginUser: string;
  isLogin: boolean;
  homePath: string;
  token: string;
  // 刷新token
  refreshToken: string;
  role: string;
  // 当前角色ID
  currentRoleId: string;
  // 用户角色列表
  userRoles: RoleModel[];
  setToken: (token: string) => void;
  login: (
    loginUser: string,
    token: string,
    refreshToken: string,
    role: string,
  ) => void;
  logout: () => void;
  setHomePath: (homePath: string) => void;
  setCurrentRoleId: (roleId: string) => void;
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
      token: '',
      refreshToken: '',
      role: '',
      currentRoleId: '',
      userRoles: [],
      login: (loginUser = '', token = '', refreshToken = '', role = '') =>
        set({ loginUser, isLogin: true, token, refreshToken, role }),
      setToken: (token: string) => set({ token }),
      logout: () =>
        set({
          loginUser: '',
          isLogin: false,
          homePath: '/home',
          token: '',
          role: '',
          currentRoleId: '',
          userRoles: [],
        }),
      setHomePath: (homePath: string) => set({ homePath }),
      setCurrentRoleId: (roleId: string) => set({ currentRoleId: roleId }),
      setUserRoles: (roles: RoleModel[]) => set({ userRoles: roles }),
      switchRole: (roleId: string) => {
        set((state) => {
          const newRole = state.userRoles.find(role => role.id === roleId);
          if (newRole) {
            return { 
              currentRoleId: roleId, 
              role: newRole.roleName 
            };
          }
          return state;
        });
      },
    }),
    {
      name: 'user-storage', // 保存到 localStorage 的 key
      getStorage: () => localStorage,
    } as PersistOptions<UserState>, // 类型定义
  ),
);

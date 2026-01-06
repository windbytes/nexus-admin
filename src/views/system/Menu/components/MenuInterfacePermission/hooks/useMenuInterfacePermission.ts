import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { type InterfacePermission, menuService } from '@/services/system/menu/menuApi';
import type { MenuModel } from '@/services/system/menu/type';

// 组件状态类型
interface ComponentState {
  permissionList: InterfacePermission[];
  editingId: string | null;
  editForm: {
    id: string;
    code: string;
    remark: string;
    path: string;
    method: string;
    name: string;
  };
  nextId: number;
  errors: {
    code?: string;
    remark?: string;
    path?: string;
    method?: string;
    name?: string;
  };
  pagination: {
    current?: number;
    pageSize?: number;
    total: number;
    totalPage: number;
  };
}

/**
 * 菜单接口权限管理 Hook
 */
export const useMenuInterfacePermission = (menu?: MenuModel) => {
  const { modal } = App.useApp();
  const queryClient = useQueryClient();

  // 合并所有状态到一个对象中
  const [state, setState] = useState<ComponentState>({
    permissionList: [],
    editingId: null,
    editForm: { id: '', code: '', remark: '', path: '', method: '', name: '' },
    nextId: 1,
    errors: {},
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      totalPage: 0,
    },
  });

  // 查询菜单接口权限数据
  const {
    isFetching,
    data: initialData,
    refetch,
  } = useQuery({
    queryKey: ['menu-interface-permission', menu?.id, state.pagination.current, state.pagination.pageSize],
    queryFn: async () => {
      if (!menu?.id) {
        return { records: [], totalRow: 0, pageNumber: 1, pageSize: 10, totalPage: 0 };
      }
      const response = await menuService.queryInterfacePermissions({
        menuId: menu.id,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
      });
      return response;
    },
    enabled: !!menu?.id,
  });

  // 保存接口权限的mutation
  const savePermissionMutation = useMutation({
    mutationFn: async (data: { type: 'create' | 'update' | 'delete'; permission: InterfacePermission }) => {
      switch (data.type) {
        case 'create':
          return await menuService.createInterfacePermission({
            menuId: menu?.id || '',
            code: data.permission.code,
            remark: data.permission.remark,
            path: data.permission.path,
            method: data.permission.method,
            name: data.permission.name,
          });
        case 'update':
          return await menuService.updateInterfacePermission({
            id: data.permission.id,
            code: data.permission.code,
            remark: data.permission.remark,
            path: data.permission.path,
            method: data.permission.method,
            name: data.permission.name,
          });
        case 'delete':
          return await menuService.deleteInterfacePermission(data.permission.id);
        default:
          throw new Error('未知的操作类型');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['menu-interface-permission', menu?.id, state.pagination.current, state.pagination.pageSize],
      });
    },
  });

  // 初始化数据
  useEffect(() => {
    if (initialData?.records) {
      setState((prev) => ({
        ...prev,
        permissionList: initialData.records,
        nextId: initialData.records.length + 1,
        pagination: {
          total: initialData.totalRow,
          totalPage: initialData.totalPage,
        },
      }));
    }
  }, [initialData]);

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<ComponentState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // 清除错误状态
  const clearErrors = useCallback(() => {
    updateState({ errors: {} });
  }, [updateState]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    if (state.editingId) {
      modal.confirm({
        title: '确认刷新',
        content: '当前有未保存的编辑数据，刷新将清除这些数据。是否确认刷新？',
        okText: '确认刷新',
        cancelText: '取消',
        centered: true,
        onOk: () => {
          updateState({
            editingId: null,
            editForm: { id: '', code: '', remark: '', path: '', method: '', name: '' },
            errors: {},
            permissionList: state.permissionList.filter((item) => !item.id.startsWith('temp_')),
          });
          refetch();
        },
      });
    } else {
      refetch();
    }
  }, [refetch, state.editingId, state.permissionList, updateState, modal]);

  // 处理分页变化
  const handleTableChange = useCallback(
    (pagination: any) => {
      updateState({
        pagination: {
          ...state.pagination,
          current: pagination.current,
          pageSize: pagination.pageSize,
        },
      });
    },
    [state.pagination, updateState]
  );

  // 添加接口权限
  const handleAdd = useCallback(() => {
    if (state.editingId) {
      modal.warning({
        title: '请先完成当前编辑',
        content: '您有未保存的编辑数据，请先完成保存或取消编辑后再添加新行。',
        okText: '知道了',
        centered: true,
      });
      return;
    }

    const newRow: InterfacePermission = {
      id: `temp_${state.nextId}`,
      code: '',
      remark: '',
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      path: '',
      method: 'GET',
      name: '',
      menuName: '',
    };

    updateState({
      permissionList: [...state.permissionList, newRow],
      editingId: newRow.id,
      editForm: { id: newRow.id, code: '', remark: '', path: '', method: newRow.method, name: '' },
      nextId: state.nextId + 1,
      errors: {},
    });
  }, [state.editingId, state.permissionList, state.nextId, updateState, modal]);

  // 开始编辑
  const handleEdit = useCallback(
    (record: InterfacePermission) => {
      updateState({
        editingId: record.id,
        editForm: {
          id: record.id,
          code: record.code,
          remark: record.remark,
          path: record.path,
          method: record.method,
          name: record.name,
        },
        errors: {},
      });
    },
    [updateState]
  );

  // 取消编辑
  const handleCancelEdit = useCallback(
    (id: string) => {
      if (id.startsWith('temp_')) {
        updateState({
          permissionList: state.permissionList.filter((item) => item.id !== id),
          editingId: null,
          editForm: { id: '', code: '', remark: '', path: '', method: '', name: '' },
          errors: {},
        });
      } else {
        updateState({
          editingId: null,
          editForm: { id: '', code: '', remark: '', path: '', method: '', name: '' },
          errors: {},
        });
      }
    },
    [state.permissionList, updateState]
  );

  // 确认编辑
  const handleConfirmEdit = useCallback(
    async (id: string) => {
      clearErrors();

      const newErrors: { code?: string; remark?: string; name?: string; path?: string } = {};

      if (!state.editForm.code.trim()) {
        newErrors.code = '编码不能为空';
      }
      if (!state.editForm.name.trim()) {
        newErrors.name = '名称不能为空';
      }
      if (!state.editForm.path.trim()) {
        newErrors.path = '路径不能为空';
      }
      if (!state.editForm.remark.trim()) {
        newErrors.remark = '备注不能为空';
      }

      if (Object.keys(newErrors).length > 0) {
        updateState({ errors: newErrors });
        return;
      }

      const updatedItem = {
        ...state.permissionList.find((item) => item.id === id)!,
        name: state.editForm.name,
        path: state.editForm.path,
        method: state.editForm.method,
        code: state.editForm.code,
        remark: state.editForm.remark,
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };

      if (id.startsWith('temp_')) {
        updatedItem.id = state.nextId.toString();
        updateState({ nextId: state.nextId + 1 });
      }

      await savePermissionMutation.mutateAsync({
        type: id.startsWith('temp_') ? 'create' : 'update',
        permission: updatedItem,
      });

      updateState({
        permissionList: state.permissionList.map((item) => (item.id === id ? updatedItem : item)),
        editingId: null,
        editForm: { id: '', code: '', remark: '', path: '', method: '', name: '' },
      });
    },
    [state.editForm, state.permissionList, state.nextId, updateState, clearErrors, savePermissionMutation]
  );

  // 删除接口权限
  const handleDelete = useCallback(
    async (record: InterfacePermission) => {
      modal.confirm({
        title: '确认删除',
        content: `确定要删除接口权限 "${record.code}" 吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          await savePermissionMutation.mutateAsync({
            type: 'delete',
            permission: record,
          });

          updateState({
            permissionList: state.permissionList.filter((item) => item.id !== record.id),
          });
        },
      });
    },
    [state.permissionList, updateState, savePermissionMutation, modal]
  );

  return {
    state,
    isFetching,
    savePermissionMutation,
    updateState,
    handleRefresh,
    handleTableChange,
    handleAdd,
    handleEdit,
    handleCancelEdit,
    handleConfirmEdit,
    handleDelete,
  };
};

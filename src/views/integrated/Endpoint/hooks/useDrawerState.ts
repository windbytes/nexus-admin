import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { useCallback, useReducer } from 'react';

/**
 * Modal/Drawer状态定义
 */
interface DrawerState {
  // Modal状态
  modalVisible: boolean;
  modalTitle: string;
  currentRecord: Partial<Endpoint> | null;
  isViewMode: boolean;
  callChainTraceModalVisible: boolean;
  callChainTraceEndpoint: Endpoint | null;

  // Drawer状态
  testDrawerVisible: boolean;
  testEndpoint: Endpoint | null;
  detailDrawerVisible: boolean;
  detailEndpoint: Endpoint | null;
  versionDrawerVisible: boolean;
  versionEndpoint: Endpoint | null;
  logDrawerVisible: boolean;
  logEndpoint: Endpoint | null;
  dependenciesDrawerVisible: boolean;
  dependenciesEndpoint: Endpoint | null;
  // 选择状态
  selectedRowKeys: React.Key[];
  selectedRows: Endpoint[];
}

/**
 * 初始状态
 */
const initialState: DrawerState = {
  modalVisible: false,
  modalTitle: '新增端点',
  currentRecord: null,
  isViewMode: false,
  callChainTraceModalVisible: false,
  callChainTraceEndpoint: null,

  testDrawerVisible: false,
  testEndpoint: null,
  detailDrawerVisible: false,
  detailEndpoint: null,
  versionDrawerVisible: false,
  versionEndpoint: null,
  logDrawerVisible: false,
  logEndpoint: null,
  dependenciesDrawerVisible: false,
  dependenciesEndpoint: null,

  selectedRowKeys: [],
  selectedRows: [],
};

/**
 * Modal/Drawer状态管理Hook
 * 统一管理所有弹窗和抽屉的显示/隐藏状态
 */
export const useDrawerState = () => {
  const [state, dispatch] = useReducer(
    (prev: DrawerState, action: Partial<DrawerState>) => ({
      ...prev,
      ...action,
    }),
    initialState
  );

  // Modal操作
  const modalActions = {
    openAdd: useCallback(() => {
      dispatch({
        modalVisible: true,
        modalTitle: '新增端点',
        currentRecord: null,
        isViewMode: false,
      });
    }, []),

    openEdit: useCallback((record: Endpoint) => {
      dispatch({
        modalVisible: true,
        modalTitle: '编辑端点',
        currentRecord: record,
        isViewMode: false,
      });
    }, []),

    openClone: useCallback((record: Endpoint) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createTime, updateTime, createBy, updateBy, ...cloneData } = record;
      dispatch({
        modalVisible: true,
        modalTitle: '克隆端点',
        currentRecord: {
          ...cloneData,
          name: `${record.name}_副本`,
        } as Partial<Endpoint>,
        isViewMode: false,
      });
    }, []),

    openView: useCallback((record: Endpoint) => {
      dispatch({
        modalVisible: true,
        modalTitle: '查看端点',
        currentRecord: record,
        isViewMode: true,
      });
    }, []),

    close: useCallback(() => {
      dispatch({
        modalVisible: false,
        currentRecord: null,
        isViewMode: false,
      });
    }, []),
    openCallChainTrace: useCallback((record: Endpoint) => {
      dispatch({
        callChainTraceModalVisible: true,
        callChainTraceEndpoint: record,
      });
    }, []),
    closeCallChainTrace: useCallback(() => {
      dispatch({
        callChainTraceModalVisible: false,
        callChainTraceEndpoint: null,
      });
    }, []),
  };

  // Drawer操作
  const drawerActions = {
    openDetail: useCallback((record: Endpoint) => {
      dispatch({
        detailDrawerVisible: true,
        detailEndpoint: record,
      });
    }, []),

    closeDetail: useCallback(() => {
      dispatch({
        detailDrawerVisible: false,
        detailEndpoint: null,
      });
    }, []),

    openTest: useCallback((record: Endpoint) => {
      dispatch({
        testDrawerVisible: true,
        testEndpoint: record,
      });
    }, []),

    closeTest: useCallback(() => {
      dispatch({
        testDrawerVisible: false,
        testEndpoint: null,
      });
    }, []),

    openVersion: useCallback((record: Endpoint) => {
      dispatch({
        versionDrawerVisible: true,
        versionEndpoint: record,
      });
    }, []),

    closeVersion: useCallback(() => {
      dispatch({
        versionDrawerVisible: false,
        versionEndpoint: null,
      });
    }, []),

    openLog: useCallback((record: Endpoint) => {
      dispatch({
        logDrawerVisible: true,
        logEndpoint: record,
      });
    }, []),

    closeLog: useCallback(() => {
      dispatch({
        logDrawerVisible: false,
        logEndpoint: null,
      });
    }, []),
    openDependencies: useCallback((record: Endpoint) => {
      dispatch({
        dependenciesDrawerVisible: true,
        dependenciesEndpoint: record,
      });
    }, []),
    closeDependencies: useCallback(() => {
      dispatch({
        dependenciesDrawerVisible: false,
        dependenciesEndpoint: null,
      });
    }, []),
  };

  // 选择操作
  const selectionActions = {
    setSelection: useCallback((selectedRowKeys: React.Key[], selectedRows: Endpoint[]) => {
      dispatch({
        selectedRowKeys,
        selectedRows,
      });
    }, []),

    clearSelection: useCallback(() => {
      dispatch({
        selectedRowKeys: [],
        selectedRows: [],
      });
    }, []),
  };

  return {
    state,
    modalActions,
    drawerActions,
    selectionActions,
  };
};

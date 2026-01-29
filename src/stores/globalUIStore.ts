import { create } from "zustand";

/**
 * 控制全局 UI 状态的 store
 */
interface GlobalUIStore {
    /** 搜索菜单模态框是否打开 */
    searchMenuModalOpen: boolean;
    /** 设置搜索菜单模态框是否打开 */
    setSearchMenuModalOpen: (open: boolean) => void;

    /** 设置菜单模态框是否打开 */
    settingMenuModalOpen: boolean;
    /** 设置菜单模态框是否打开 */
    setSettingMenuModalOpen: (open: boolean) => void;
}

// 创建控制全局 UI 状态的 store
const useGlobalUIStore = create<GlobalUIStore>((set) => ({
    searchMenuModalOpen: false,
    setSearchMenuModalOpen: (open: boolean) => set({ searchMenuModalOpen: open }),
    settingMenuModalOpen: false,
    setSettingMenuModalOpen: (open: boolean) => set({ settingMenuModalOpen: open }),
}))

export default useGlobalUIStore;
import type { IPlugin } from '../core/plugin/types';
import { FileMenuModal } from '../modals/FileMenuModal';

const FILE_MODAL_TYPE = 'FileMenuModal';

/**
 * 文件能力插件（示例）
 * 负责注册与文件相关的弹窗、命令，便于将「文件」相关功能模块化，后续可扩展新建/打开/保存/导出等
 */
export const filePlugin: IPlugin = {
  meta: {
    id: 'nwriter.file',
    name: '文件',
    version: '1.0.0',
    description: '文件菜单与相关弹窗、命令',
  },
  install(ctx) {
    const { registerModal, registerCommand, openModal } = ctx;
    registerModal(FILE_MODAL_TYPE, FileMenuModal);
    registerCommand('file.openMenu', (menuKey: any) => {
      openModal(FILE_MODAL_TYPE, { menuKey });
    });
  },
  deactivate(ctx) {
    ctx.unregisterModal(FILE_MODAL_TYPE);
    ctx.unregisterCommand('file.openMenu');
  },
  uninstall(ctx) {
    ctx.unregisterModal(FILE_MODAL_TYPE);
    ctx.unregisterCommand('file.openMenu');
  },
};

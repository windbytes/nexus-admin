/**
 * 粘贴下拉插件：为工具栏「粘贴」提供由插件注册的 Dropdown 内容（示例：插件实现）
 */
import { useEditorContext } from '../core';
import { executeCommand } from '../core/extension';
import type { IPlugin } from '../core/plugin/types';

function PasteDropdownContent() {
  // 获取编辑器上下文对象
  const editorContext = useEditorContext();
  const handleOption = (mode: string) => {
    executeCommand('edit.paste', 'paste', mode).catch(() => {
      /* 未注册命令时忽略 */
      console.log('执行粘贴命令', mode, editorContext.editorMode);
    });
  };

  return (
    <div className="flex flex-col gap-0.5 py-1">
      <button
        type="button"
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
        onClick={() => handleOption('keepFormat')}
      >
        保留源格式
      </button>
      <button
        type="button"
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
        onClick={() => handleOption('textOnly')}
      >
        仅文本
      </button>
      <button
        type="button"
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
        onClick={() => handleOption('image')}
      >
        图片
      </button>
    </div>
  );
}

export const pasteDropdownPlugin: IPlugin = {
  meta: {
    id: 'nwriter.pasteDropdown',
    name: '粘贴下拉',
    version: '1.0.0',
    description: '为开始栏粘贴按钮提供自定义下拉内容',
  },
  install(ctx) {
    ctx.registerDropdownContent('paste', () => <PasteDropdownContent />);
  },
  uninstall(ctx) {
    ctx.unregisterDropdownContent('paste');
  },
};

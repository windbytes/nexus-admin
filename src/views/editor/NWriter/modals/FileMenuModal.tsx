import { Button } from 'antd';
import type { ModalPropsBase } from '../modal/types';

export interface FileMenuModalProps extends ModalPropsBase {
  /** 文件菜单项 key，如 'new'、'open'、'save' */
  menuKey?: string;
}

/**
 * 文件菜单弹窗（示例）
 * 根据菜单 key 展示不同内容，实际业务可拆成多个弹窗或在此做分支
 */
export function FileMenuModal({ menuKey, onResolve, onReject }: FileMenuModalProps) {
  return (
    <div className="py-2">
      <p className="mb-3 text-gray-600">
        文件菜单项: <strong>{menuKey ?? '(未指定)'}</strong>
      </p>
      <p className="mb-4 text-sm text-gray-500">
        此处可扩展为：新建/打开/保存/导出等具体表单或确认框，通过 onResolve 回传结果。
      </p>
      <div className="flex justify-end gap-2">
        <Button onClick={() => onReject()}>取消</Button>
        <Button type="primary" onClick={() => onResolve({ action: menuKey ?? '' })}>
          确定
        </Button>
      </div>
    </div>
  );
}

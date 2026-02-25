/**
 * 字体颜色下拉内容（具体功能实现）：色板点击后执行 format.fontColor 命令
 */
import { memo } from 'react';
import { executeCommand } from '../../../core/extension';

const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#c00000',
  '#ff0000',
  '#ffc000',
  '#ffff00',
  '#92d050',
  '#00b050',
  '#00b0f0',
  '#0070c0',
  '#002060',
  '#7030a0',
];

interface FontColorDropdownContentProps {
  command?: string;
}

function FontColorDropdownContent({ command = 'format.fontColor' }: FontColorDropdownContentProps) {
  const handleColorClick = (color: string) => {
    executeCommand(command, 'fontColor', color).catch(() => {
      /* 占位命令或未注册时忽略 */
    });
  };

  return (
    <div className="p-2">
      <div className="mb-1.5 text-xs text-gray-500">主题颜色</div>
      <div className="grid grid-cols-6 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="h-5 w-5 rounded border border-gray-300 hover:ring-2 hover:ring-blue-400"
            style={{ backgroundColor: color }}
            title={color}
            onClick={() => handleColorClick(color)}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(FontColorDropdownContent);

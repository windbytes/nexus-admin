/**
 * 编辑器底部状态栏
 * 左侧：页码、行列、坐标、当前字体等；中间：模式切换下拉框；右侧：缩放、保存、全屏
 */
import { Select } from 'antd';

/** 模式选项（可扩展） */
const MODE_OPTIONS = [
  { value: 'edit', label: '编辑模式' },
  { value: 'preview', label: '预览模式' },
  { value: 'readonly', label: '只读模式' },
];

interface StatusBarProps {
  page?: number;
  line?: number;
  column?: number;
  x?: number;
  y?: number;
  fontFamily?: string;
  fontSize?: number;
  /** 当前缩放比例，用于右侧显示 */
  scale?: number;
  /** 当前模式 */
  mode?: string;
  /** 模式切换 */
  onModeChange?: (value: string) => void;
  /** 保存回调 */
  onSave?: () => void;
  /** 全屏回调 */
  onFullscreen?: () => void;
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  page = 1,
  line = 1,
  column = 1,
  x = 0,
  y = 0,
  fontFamily = '宋体',
  fontSize = 20,
  scale = 1,
  mode = 'edit',
  onModeChange,
  onSave,
  onFullscreen,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 ${className}`}
    >
      {/* 左侧：状态信息 */}
      <span className="shrink-0">
        状态: 第{page}页, 第{line}行, 第{column}列, X: {x}, Y: {y}, 当前字体: {fontFamily}, {fontSize}。
      </span>

      {/* 中间：模式切换 */}
      <Select
        size="small"
        value={mode}
        onChange={onModeChange}
        options={MODE_OPTIONS}
        className="w-28 shrink-0"
      />

      {/* 右侧：缩放、保存、全屏 */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-gray-500">缩放: {Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="text-gray-600 hover:text-gray-800"
          title="保存"
          onClick={onSave}
        >
          [保存]
        </button>
        <button
          type="button"
          className="text-gray-600 hover:text-gray-800"
          title="全屏"
          onClick={onFullscreen}
        >
          [全屏]
        </button>
      </div>
    </div>
  );
};

export default StatusBar;

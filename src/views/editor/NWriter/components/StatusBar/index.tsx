/**
 * 编辑器底部状态栏
 * 左侧：页数、行、列、字数；中间：模式切换；右侧：显示比例 Dropdown、缩放条、全屏
 */
import { DownOutlined, FullscreenOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, InputNumber, Select, Slider, Space } from 'antd';
import { useState } from 'react';

/** 模式选项 */
const MODE_OPTIONS = [
  { value: 'edit', label: '编辑模式' },
  { value: 'preview', label: '预览模式' },
  { value: 'readonly', label: '只读模式' },
];

/** 预设显示比例选项 */
const PRESET_SCALES = [50, 75, 100, 125, 150, 200];

const SCALE_MIN = 10;
const SCALE_MAX = 200;

interface StatusBarProps {
  page?: number;
  line?: number;
  column?: number;
  /** 字数 */
  wordCount?: number;
  /** 当前缩放比例 0.01~2，如 1 表示 100% */
  scale?: number;
  /** 缩放变化（受控时由外部传入 scale） */
  onScaleChange?: (scale: number) => void;
  /** 当前模式 */
  mode?: string;
  /** 模式切换 */
  onModeChange?: (value: string) => void;
  /** 全屏回调 */
  onFullscreen?: () => void;
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  page = 1,
  line = 1,
  column = 1,
  wordCount = 0,
  scale: propScale,
  onScaleChange,
  mode = 'edit',
  onModeChange,
  onFullscreen,
  className = '',
}) => {
  const [internalScale, setInternalScale] = useState(100);
  const [customInput, setCustomInput] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isControlled = propScale != null;
  const scalePercent = isControlled ? Math.round(propScale * 100) : internalScale;
  const setScalePercent = (p: number) => {
    const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, p));
    if (isControlled) {
      onScaleChange?.(clamped / 100);
    } else {
      setInternalScale(clamped);
      onScaleChange?.(clamped / 100);
    }
  };

  const scaleMenuItems: MenuProps['items'] = [
    ...PRESET_SCALES.map((p) => ({
      key: `preset-${p}`,
      label: `${p}%`,
      onClick: () => {
        setScalePercent(p);
        setDropdownOpen(false);
      },
    })),
    { type: 'divider' as const },
    {
      key: 'custom',
      label: (
        <div className="flex items-center gap-2 py-1" onClick={(e) => e.stopPropagation()}>
          <span className="shrink-0 text-gray-500">自定义</span>
          <Space.Compact>
            <InputNumber
              size="small"
              min={SCALE_MIN}
              max={SCALE_MAX}
              value={customInput ?? undefined}
              placeholder={`${scalePercent}`}
              onChange={(v) => setCustomInput(v ?? null)}
              onPressEnter={() => {
                if (customInput != null && Number.isFinite(customInput)) {
                  setScalePercent(customInput);
                  setCustomInput(null);
                  setDropdownOpen(false);
                }
              }}
              className="w-24"
            />
            <span>%</span>
          </Space.Compact>
        </div>
      ),
    },
  ];

  return (
    <div
      className={`flex items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 ${className}`}
    >
      {/* 左侧：页数、行、列、字数 */}
      <div className="shrink-0">
        <span>第{page}页</span>
        <span className="mx-2 text-gray-300">|</span>
        <span>第{line}行</span>
        <span className="mx-2 text-gray-300">|</span>
        <span>第{column}列</span>
        <span className="mx-2 text-gray-300">|</span>
        <span>{wordCount} 字</span>
      </div>

      {/* 中间：模式切换 */}
      <Select
        size="small"
        variant="borderless"
        value={mode}
        onChange={onModeChange}
        options={MODE_OPTIONS}
        suffixIcon={null}
        className="w-28 shrink-0"
      />

      {/* 右侧：比例 Dropdown + 缩放条 + 全屏 */}
      <div className="flex shrink-0 items-center gap-3">
        {/* 显示比例下拉：快速切换或自定义 */}
        <Dropdown
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          menu={{ items: scaleMenuItems }}
          trigger={['click']}
          placement="top"
        >
          <button type="button" className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700">
            <span>{scalePercent}%</span>
            <DownOutlined className="text-[10px]" />
          </button>
        </Dropdown>

        {/* 缩放条：减号 + Slider + 加号 */}
        <div className="flex w-44 items-center gap-1">
          <Button
            type="text"
            size="small"
            className="flex h-6 w-6 items-center justify-center p-0 text-gray-500 hover:text-gray-700"
            icon={<MinusOutlined />}
            onClick={() => setScalePercent(scalePercent - 10)}
            disabled={scalePercent <= SCALE_MIN}
          />
          <Slider
            min={SCALE_MIN}
            max={SCALE_MAX}
            value={scalePercent}
            onChange={(v) => setScalePercent(Array.isArray(v) ? v[0] : v)}
            className="mb-0 flex-1"
            tooltip={{ formatter: (v) => `${v}%` }}
          />
          <Button
            type="text"
            size="small"
            className="flex h-6 w-6 items-center justify-center p-0 text-gray-500 hover:text-gray-700"
            icon={<PlusOutlined />}
            onClick={() => setScalePercent(scalePercent + 10)}
            disabled={scalePercent >= SCALE_MAX}
          />
        </div>

        {/* 全屏 */}
        <Button
          type="text"
          size="small"
          className="flex h-6 w-6 items-center justify-center p-0 text-gray-500 hover:text-gray-700"
          icon={<FullscreenOutlined />}
          title="全屏"
          onClick={onFullscreen}
        />
      </div>
    </div>
  );
};

export default StatusBar;

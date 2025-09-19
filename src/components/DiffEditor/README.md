# DiffEditor 组件

基于 `@monaco-editor/react` 封装的差异对比编辑器组件，用于显示和对比两个文件或代码的差异。

## 功能特性

- 🎯 **差异对比**: 支持并排和行内两种差异显示模式
- 🎨 **主题支持**: 支持浅色、深色、高对比度主题
- 🌍 **多语言**: 支持 JavaScript、TypeScript、JSON、Python 等多种语言
- 📊 **差异统计**: 提供新增、删除、修改行数的统计信息
- 🎮 **交互控制**: 支持跳转到下一个/上一个差异
- 📱 **响应式**: 支持移动端和桌面端适配
- ⚙️ **高度可配置**: 支持丰富的配置选项

## 安装依赖

```bash
npm install @monaco-editor/react
```

## 基础用法

```tsx
import React, { useRef } from 'react';
import { DiffEditor } from '@/components/DiffEditor';

const MyComponent = () => {
  const diffEditorRef = useRef<DiffEditorRef>(null);

  const originalCode = `{
  "name": "开始节点",
  "type": "start"
}`;

  const modifiedCode = `{
  "name": "流程开始",
  "type": "start"
}`;

  return (
    <DiffEditor
      ref={diffEditorRef}
      original={originalCode}
      modified={modifiedCode}
      language="json"
      height="400px"
      originalTitle="原始版本"
      modifiedTitle="修改版本"
    />
  );
};
```

## 高级用法

```tsx
import React, { useRef, useState } from 'react';
import { DiffEditor, DiffEditorRef } from '@/components/DiffEditor';
import { Button, Card, Statistic, Row, Col } from 'antd';

const AdvancedDiffExample = () => {
  const diffEditorRef = useRef<DiffEditorRef>(null);
  const [statistics, setStatistics] = useState(null);

  const handleGetStatistics = () => {
    if (diffEditorRef.current) {
      const stats = diffEditorRef.current.getDiffStatistics();
      setStatistics(stats);
    }
  };

  const handleGoToNextDiff = () => {
    diffEditorRef.current?.goToNextDiff();
  };

  const handleGoToPreviousDiff = () => {
    diffEditorRef.current?.goToPreviousDiff();
  };

  return (
    <div>
      <Card title="差异对比" style={{ marginBottom: 16 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Button onClick={handleGoToPreviousDiff}>上一个差异</Button>
          </Col>
          <Col span={6}>
            <Button onClick={handleGoToNextDiff}>下一个差异</Button>
          </Col>
          <Col span={6}>
            <Button onClick={handleGetStatistics}>获取统计</Button>
          </Col>
        </Row>

        {statistics && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic title="总变更" value={statistics.totalChanges} />
            </Col>
            <Col span={6}>
              <Statistic 
                title="新增" 
                value={statistics.insertions} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="删除" 
                value={statistics.deletions} 
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="修改" 
                value={statistics.modifications} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
        )}

        <DiffEditor
          ref={diffEditorRef}
          original={originalCode}
          modified={modifiedCode}
          language="json"
          theme="vs-dark"
          height="500px"
          renderSideBySide={true}
          enableSplitViewResizing={true}
          showMinimap={false}
          fontSize={14}
        />
      </Card>
    </div>
  );
};
```

## API 参考

### DiffEditorProps

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| original | string | '' | 原始内容 |
| modified | string | '' | 修改后内容 |
| language | SupportedLanguage | 'json' | 语言类型 |
| theme | EditorTheme | 'vs' | 主题 |
| readOnly | boolean | true | 是否只读 |
| showLineNumbers | boolean | true | 是否显示行号 |
| showMinimap | boolean | false | 是否显示小地图 |
| wordWrap | 'off' \| 'on' \| 'wordWrapColumn' \| 'bounded' | 'off' | 自动换行 |
| fontSize | number | 14 | 字体大小 |
| fontFamily | string | 'Consolas, "Courier New", monospace' | 字体族 |
| lineHeight | number | 20 | 行高 |
| renderSideBySide | boolean | true | 是否并排显示 |
| enableSplitViewResizing | boolean | true | 是否启用分割视图调整大小 |
| ignoreTrimWhitespace | boolean | false | 是否忽略空白字符差异 |
| originalTitle | string | '原始版本' | 原始内容标题 |
| modifiedTitle | string | '修改版本' | 修改后内容标题 |
| height | string \| number | '400px' | 编辑器高度 |
| width | string \| number | '100%' | 编辑器宽度 |
| onMount | (editor: editor.IStandaloneDiffEditor) => void | - | 编辑器挂载回调 |
| options | editor.IDiffEditorConstructionOptions | {} | 自定义选项 |
| className | string | '' | 类名 |
| style | React.CSSProperties | {} | 样式 |

### DiffEditorRef

| 方法 | 类型 | 描述 |
|------|------|------|
| getEditor | () => editor.IStandaloneDiffEditor \| null | 获取差异编辑器实例 |
| getOriginalEditor | () => editor.IStandaloneCodeEditor \| null | 获取原始编辑器实例 |
| getModifiedEditor | () => editor.IStandaloneCodeEditor \| null | 获取修改后编辑器实例 |
| getOriginalValue | () => string | 获取原始内容 |
| getModifiedValue | () => string | 获取修改后内容 |
| setOriginalValue | (value: string) => void | 设置原始内容 |
| setModifiedValue | (value: string) => void | 设置修改后内容 |
| setDiff | (original: string, modified: string) => void | 设置差异内容 |
| getDiffStatistics | () => DiffStatistics | 获取差异统计信息 |
| goToNextDiff | () => void | 跳转到下一个差异 |
| goToPreviousDiff | () => void | 跳转到上一个差异 |
| goToDiff | (index: number) => void | 跳转到指定差异 |
| getDiffs | () => editor.ILineChange[] | 获取所有差异 |
| focus | () => void | 聚焦编辑器 |
| blur | () => void | 失焦编辑器 |
| isReadOnly | () => boolean | 是否只读 |
| setReadOnly | (readOnly: boolean) => void | 设置只读状态 |
| getLanguage | () => string | 获取语言 |
| setLanguage | (language: SupportedLanguage) => void | 设置语言 |
| getTheme | () => string | 获取主题 |
| setTheme | (theme: EditorTheme) => void | 设置主题 |
| updateOptions | (options: editor.IDiffEditorConstructionOptions) => void | 更新选项 |
| recomputeDiff | () => void | 重新计算差异 |

### DiffStatistics

| 属性 | 类型 | 描述 |
|------|------|------|
| totalChanges | number | 总变更数 |
| insertions | number | 新增行数 |
| deletions | number | 删除行数 |
| modifications | number | 修改行数 |

## 支持的语言

- JavaScript (.js, .jsx, .mjs)
- TypeScript (.ts, .tsx)
- JSON (.json)
- Java (.java)
- Groovy (.groovy, .gvy)
- SQL (.sql)
- Python (.py, .pyw, .pyi)
- HTML (.html, .htm, .xhtml)
- CSS (.css, .scss, .sass, .less)
- XML (.xml, .xsd, .xsl, .xslt)
- YAML (.yml, .yaml)
- Markdown (.md, .markdown)
- Shell Script (.sh, .bash, .zsh, .fish)
- Plain Text (.txt, .log)

## 主题

- `vs`: 浅色主题
- `vs-dark`: 深色主题
- `hc-black`: 高对比度主题

## 样式定制

组件提供了丰富的 CSS 类名用于样式定制：

```scss
.diff-editor-container {
  // 基础容器样式
  
  &.readonly {
    // 只读状态样式
  }
  
  &.dark-theme {
    // 暗色主题样式
  }
  
  &.high-contrast-theme {
    // 高对比度主题样式
  }
}

.diff-statistics {
  // 差异统计信息样式
}

.diff-navigation {
  // 差异导航按钮样式
}
```

## 注意事项

1. 确保已安装 `@monaco-editor/react` 依赖
2. 组件默认只读，如需编辑请设置 `readOnly={false}`
3. 差异统计信息需要手动调用 `getDiffStatistics()` 方法获取
4. 组件支持响应式设计，在移动端会自动调整布局
5. 建议在组件卸载时调用 `dispose()` 方法清理资源

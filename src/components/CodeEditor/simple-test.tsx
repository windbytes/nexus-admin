import type React from 'react';
import { useState } from 'react';
import { CodeEditor } from './index';

const SimpleTest: React.FC = () => {
  const [code, setCode] = useState('console.log("Hello, World!");');

  return (
    <div style={{ padding: '20px' }}>
      <h2>代码编辑器简单测试</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>JavaScript 编辑器</h3>
        <CodeEditor
          value={code}
          language="javascript"
          theme="vs"
          height="300px"
          onChange={(value) => setCode(value || '')}
          placeholder="请输入 JavaScript 代码..."
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Python 编辑器</h3>
        <CodeEditor
          value="# Python 代码示例\nprint('Hello, Python!')"
          language="python"
          theme="vs-dark"
          height="200px"
          readOnly={false}
          showLineNumbers={true}
          showMinimap={true}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>JSON 编辑器</h3>
        <CodeEditor
          value={`{
  "name": "测试配置",
  "version": "1.0.0"
}`}
          language="json"
          theme="vs"
          height="150px"
          fontSize={12}
        />
      </div>

      <div>
        <h3>当前代码内容</h3>
        <pre
          style={{
            background: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          {code}
        </pre>
      </div>
    </div>
  );
};

export default SimpleTest;

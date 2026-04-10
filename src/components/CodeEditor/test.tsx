import type React from 'react';
import { CodeEditor } from './index';

// 简单的测试组件
const TestCodeEditor: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>代码编辑器测试</h2>

      <h3>JavaScript 示例</h3>
      <CodeEditor
        value={`// JavaScript 测试代码
function test() {
  const message = "Hello, World!";
  console.log(message);
  return message;
}

test();`}
        language="javascript"
        theme="vs"
        height="200px"
        onChange={(value) => console.log('JS代码变化:', value)}
      />

      <h3>Python 示例</h3>
      <CodeEditor
        value={`# Python 测试代码
def test():
    message = "Hello, World!"
    print(message)
    return message

test()`}
        language="python"
        theme="vs-dark"
        height="200px"
        onChange={(value) => console.log('Python代码变化:', value)}
      />

      <h3>JSON 示例</h3>
      <CodeEditor
        value={`{
  "name": "测试配置",
  "version": "1.0.0",
  "description": "这是一个测试配置文件"
}`}
        language="json"
        theme="vs"
        height="150px"
        onChange={(value) => console.log('JSON代码变化:', value)}
      />

      <h3>只读模式</h3>
      <CodeEditor
        value="这是一个只读的代码编辑器，无法编辑内容。"
        language="plaintext"
        theme="vs"
        height="100px"
        readOnly={true}
      />
    </div>
  );
};

export default TestCodeEditor;

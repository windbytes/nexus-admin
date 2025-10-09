import React from 'react';
import { Routes, Route } from 'react-router';
import ActivityTabBar from '@/components/TabBar/ActivityTabBar';

// 示例页面组件
const HomePage: React.FC = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-4">
      <h1>首页</h1>
      <p>这是一个示例首页组件</p>
      <div className="mt-4">
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          点击计数: {count}
        </button>
      </div>
      <div className="mt-4">
        <p>这个组件启用了 keep-alive，切换 tab 后状态会被保持</p>
      </div>
    </div>
  );
};

const AboutPage: React.FC = () => {
  const [inputValue, setInputValue] = React.useState('');
  
  return (
    <div className="p-4">
      <h1>关于页面</h1>
      <p>这是一个示例关于页面组件</p>
      <div className="mt-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入一些内容..."
          className="px-3 py-2 border rounded"
        />
        <p className="mt-2">输入的内容: {inputValue}</p>
      </div>
      <div className="mt-4">
        <p>这个组件也启用了 keep-alive，输入的内容会被保持</p>
      </div>
    </div>
  );
};

const ContactPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1>联系页面</h1>
      <p>这是一个示例联系页面组件</p>
      <div className="mt-4">
        <p>这个组件没有启用 keep-alive，每次切换都会重新渲染</p>
      </div>
    </div>
  );
};

// 示例应用组件
const ExampleApp: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <div className="bg-gray-100 p-4">
        <h1 className="text-xl font-bold">ActivityTabBar 示例应用</h1>
      </div>
      
      {/* TabBar 组件 */}
      <ActivityTabBar className="flex-shrink-0">
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </ActivityTabBar>
      
      {/* 底部信息 */}
      <div className="bg-gray-50 p-2 text-sm text-gray-600">
        <p>基于 React 19.2 Activity 组件实现的 TabBar</p>
      </div>
    </div>
  );
};

export default ExampleApp;

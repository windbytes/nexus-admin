import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server';

const buildId = Math.random().toString(36).slice(2, 8);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        // 启用 React 编译器优化
        babel: {
          plugins: [
            // React 编译器插件
            ['babel-plugin-react-compiler'],
          ],
        },
      }),
      tailwindcss(),
      viteCompression({
        verbose: !isProduction,
        disable: !isProduction,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // 将iconify图标转换成react组件（本地化）
      Icons({
        compiler: 'jsx',
      }),
      // mock 插件仅开发环境启用
      ...(mode === 'development' ? [mockDevServerPlugin({ prefix: '/api' })] : []),
    ],
    // 配置分包
    build: {
      // 生产环境可设为 true 或 'hidden' 便于接入 Sentry 等错误追踪
      sourcemap: false,
      // css代码分割
      cssCodeSplit: isProduction,
      cssTarget: 'chrome80',
      // 使用 Vite 8 默认 Oxc minifier（比 Terser 更快）
      target: 'es2020',
      // 设置 chunk 大小警告限制
      chunkSizeWarningLimit: 800,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'lib-react',
                test: /node_modules[\\/](react|react-dom)/,
              },
              {
                name: 'lib-router',
                test: /node_modules[\\/]@tanstack[\\/]react-router/,
              },
              {
                name: 'lib-utils',
                test: /node_modules[\\/](lodash-es|dayjs|crypto-js|jsencrypt)/,
              },
              {
                name: 'lib-network',
                test: /node_modules[\\/]axios/,
              },
              {
                name: 'lib-chart',
                test: /node_modules[\\/]echarts/,
              },
              {
                name: 'lib-antd-icons',
                test: /node_modules[\\/]@ant-design\/icons/,
              },
              {
                name: 'lib-other',
                test: /node_modules[\\/](classnames|@iconify-icon|i18next)/,
              },
            ],
          },
          minify: true,
          chunkFileNames: `static/js/${buildId}-[hash].js`,
          entryFileNames: `static/js/${buildId}-[hash].js`,
          // 按文件类型进行拆分文件夹
          assetFileNames: `static/[ext]/${buildId}-[hash].[ext]`,
        },
      },
    },
    // 配置路径别名解析
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'antd',
        'lodash-es',
        'dayjs',
        'axios',
        'echarts',
        '@ant-design/icons',
        '@tanstack/react-query',
        '@tanstack/react-router',
        '@monaco-editor/react',
      ],
    },
    // css预处理器
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${path.resolve(__dirname, './src/styles/variables.scss').replace(/\\\\/g, '/')}";`,
        },
      },
    },
    // 服务器配置以及代理
    server: {
      port: 8000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:9193',
          changeOrigin: true,
          ws: true,
          rewrite: (pathName) => pathName.replace(/^\/api/, ''),
        },
      },
    },
  };
});

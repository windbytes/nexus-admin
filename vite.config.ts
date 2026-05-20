import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { compression } from 'vite-plugin-compression2';
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const env = loadEnv(mode, process.cwd(), '');
  const devServerPort = Number(env.VITE_DEV_SERVER_PORT || '8000');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:9527';
  /** Netty WebSocket 与 Spring 不同端口；路径无 /api 前缀，需在代理中剥离 */
  const wsProxyTarget = env.VITE_WS_PROXY_TARGET || 'http://localhost:8891';

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      // 生产环境同时生成 gzip 和 brotli 压缩文件
      ...(isProduction
        ? [
            compression({ algorithms: ['gzip'], threshold: 1024 }),
            compression({ algorithms: ['brotliCompress'], threshold: 1024 }),
          ]
        : []),
      // mock 插件仅开发环境启用
      ...(mode === 'development' ? [mockDevServerPlugin({ prefix: '/api' })] : []),
    ],
    // 配置分包
    build: {
      // 生产环境可设为 true 或 'hidden' 便于接入 Sentry 等错误追踪
      sourcemap: false,
      // css代码分割
      cssCodeSplit: isProduction,
      cssTarget: 'chrome100',
      // 使用 Vite 8 默认 Oxc minifier（比 Terser 更快）
      target: 'es2022',
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
                test: /node_modules[\\/]react-router/,
              },
              {
                name: 'lib-antd',
                test: /node_modules[\\/]antd/,
              },
              {
                name: 'lib-antd-deps',
                test: /node_modules[\\/](@rc-component|@ant-design[\\/]cssinjs)/,
              },
              {
                name: 'lib-antd-icons',
                test: /node_modules[\\/]@ant-design[\\/]icons/,
              },
              {
                name: 'lib-utils',
                test: /node_modules[\\/](lodash-es|dayjs|crypto-js|jsencrypt|clsx|tailwind-merge)/,
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
                name: 'lib-flow',
                test: /node_modules[\\/]@xyflow/,
              },
              {
                name: 'lib-monaco',
                test: /node_modules[\\/](monaco-editor|@monaco-editor)/,
              },
              {
                name: 'lib-dnd',
                test: /node_modules[\\/]@dnd-kit/,
              },
              {
                name: 'lib-i18n',
                test: /node_modules[\\/](i18next|react-i18next)/,
              },
            ],
          },
          minify: true,
          chunkFileNames: `static/js/[hash].js`,
          entryFileNames: `static/js/[hash].js`,
          // 按文件类型进行拆分文件夹
          assetFileNames: `static/[ext]/[hash].[ext]`,
        },
      },
    },
    // 配置路径别名解析
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // 优化依赖预构建（仅保留首屏关键依赖，非首屏大型库由路由懒加载自然按需加载）
    optimizeDeps: {
      include: ['react', 'react-dom', 'antd', 'dayjs', 'axios', '@tanstack/react-query', 'react-router', 'zustand'],
    },
    // 服务器配置以及代理
    server: {
      port: devServerPort,
      host: true,
      proxy: {
        // 须写在 `/api` 之前：浏览器仍用 `/api/ws/...` 与 REST 同源，此处转发到 Netty 并去掉 `/api`
        '/api/ws': {
          target: wsProxyTarget,
          changeOrigin: true,
          ws: true,
          rewrite: (p) => p.replace(/^\/api/, '') || '/',
        },
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});

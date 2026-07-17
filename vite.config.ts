import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { compression } from 'vite-plugin-compression2';

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
      babel({
        presets: [reactCompilerPreset()],
        exclude: /node_modules/,
      }),
      tailwindcss(),
      // 生产环境同时生成 gzip 和 brotli 压缩文件
      ...(isProduction
        ? [
            compression({ algorithms: ['gzip'], threshold: 1024 }),
            compression({ algorithms: ['brotliCompress'], threshold: 1024 }),
          ]
        : []),
    ],
    build: {
      // 生产环境可设为 true 或 'hidden' 便于接入 Sentry 等错误追踪
      sourcemap: false,
      cssCodeSplit: isProduction,
      cssTarget: 'chrome100',
      target: 'es2023',
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
                name: 'lib-tanstack-router',
                test: /node_modules[\\/]@tanstack[\\/]react-router/,
              },
              {
                name: 'lib-tanstack-query',
                test: /node_modules[\\/]@tanstack[\\/]react-query/,
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
                test: /node_modules[\\/](lodash-es|dayjs|crypto-js|clsx|tailwind-merge)/,
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
                name: 'lib-i18n',
                test: /node_modules[\\/](i18next|react-i18next)/,
              },
              {
                name: 'lib-keepalive',
                test: /node_modules[\\/]keepalive-for-react/,
              },
            ],
          },
          minify: true,
          chunkFileNames: `static/js/[hash].js`,
          entryFileNames: `static/js/[hash].js`,
          assetFileNames: `static/[ext]/[hash].[ext]`,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // 预构建首屏关键依赖；antd 按需加载不强制预构建；大型懒加载库排除以加快 dev 冷启动
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'axios',
        '@tanstack/react-query',
        '@tanstack/react-router',
        'zustand',
        'i18next',
        'react-i18next',
      ],
      exclude: ['echarts', '@xyflow/react', '@monaco-editor/react'],
    },
    server: {
      port: devServerPort,
      host: true,
      warmup: {
        clientFiles: ['./src/main.tsx', './src/App.tsx', './src/app/router/index.tsx'],
      },
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

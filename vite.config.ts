import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react({
        // 只在生产环境下启用 React 编译器优化
        babel: isProduction ? {
          plugins: [['babel-plugin-react-compiler']],
        } : undefined,
      }),
      tailwindcss(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      mockDevServerPlugin({
        prefix: '/api',
      }),
    ],
    // 配置分包
    build: {
      sourcemap: false,
      // 压缩css代码
      cssCodeSplit: true,
      // 只在生产环境下启用terser代码压缩
      ...(isProduction && {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            passes: 2,
          },
          mangle: {
            toplevel: true,
            safari10: true,
          },
          format: {
            comments: false,
          },
        },
      }),
      // 优化构建
      target: 'es2015',
      // 设置 chunk 大小警告限制
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // 使用更安全的文件命名，不暴露库名
          chunkFileNames: 'static/js/[hash].js',
          entryFileNames: 'static/js/[hash].js',
          // 按文件类型进行拆分文件夹
          assetFileNames: 'static/[ext]/[hash].[ext]',
          // 使用 rolldown 的 advancedChunks 进行高级代码分割
          advancedChunks: {
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules[\\/](react|react-dom|react-router)/,
              },
              {
                name: 'utils-vendor',
                test: /node_modules[\\/](lodash-es|dayjs|crypto-js|jsencrypt)/,
              },
              {
                name: 'network-vendor',
                test: /node_modules[\\/]axios/,
              },
              {
                name: 'chart-vendor',
                test: /node_modules[\\/]echarts/,
              },
              {
                name: 'antd-vendor',
                test: /node_modules[\\/]antd/,
              },
              {
                name: 'antd-icons-vendor',
                test: /node_modules[\\/]@ant-design\/icons/,
              },
              {
                name: 'other-vendor',
                test: /node_modules[\\/](classnames|@iconify-icon|i18next)/,
              },
            ],
          },
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
      include: ['react', 'react-dom', 'antd', 'lodash-es', 'dayjs', 'axios', 'echarts', '@ant-design/icons'],
    },
    // css预处理器
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss";`,
        },
      },
    },
    // 服务器配置以及代理
    server: {
      port: 8000,
      proxy: {
        '/api': {
          target: 'http://localhost:9193',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
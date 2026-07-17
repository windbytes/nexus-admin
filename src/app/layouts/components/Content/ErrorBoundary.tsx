import { Button, Result } from 'antd';

interface ErrorFallbackProps {
  error: any;
  resetBoundary?: () => void;
  resetErrorBoundary?: () => void;
}

/**
 * 错误边界的响应
 * @param param0
 * @returns
 */
export function ErrorFallback({ error, resetBoundary, resetErrorBoundary }: ErrorFallbackProps) {
  const reset = resetBoundary || resetErrorBoundary || (() => window.location.reload());

  return (
    <Result
      status="500"
      title="500"
      subTitle={
        <>
          <p>组件渲染出现异常</p>
          <pre style={{ color: 'red' }}>{error?.message}</pre>
        </>
      }
      extra={
        <Button type="primary" onClick={reset}>
          重试
        </Button>
      }
    />
  );
}

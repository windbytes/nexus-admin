import { Button, Result } from 'antd';
import { useErrorBoundary } from 'react-error-boundary';

/**
 * 错误边界的响应
 * @param param0
 * @returns
 */
export function ErrorFallback({ error }: any) {
  const { resetBoundary } = useErrorBoundary();

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
        <Button type="primary" onClick={resetBoundary}>
          重试
        </Button>
      }
    />
  );
}

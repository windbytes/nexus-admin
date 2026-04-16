import { Collapse, Form, Input, InputNumber, Switch } from 'antd';
import { memo, useMemo } from 'react';

interface ConnectionConfigFieldsProps {
  /** 当前驱动对应的数据库类型（与资源驱动维护模块一致） */
  databaseType?: string;
  /** 新增连接时密码必填 */
  requirePassword?: boolean;
}

/**
 * 按数据库类型展示差异化表单项；未列出的类型仍渲染通用 endpoint，扩展项放入 extras。
 */
const ConnectionConfigFields = memo(({ databaseType, requirePassword }: ConnectionConfigFieldsProps) => {
  const databaseLabel = useMemo(() => {
    if (databaseType === 'SQLite') {
      return '数据库文件';
    }
    if (databaseType === 'Oracle') {
      return '库 / 服务标识';
    }
    return '数据库名';
  }, [databaseType]);

  const showOracleIds = databaseType === 'Oracle';
  const showSchema = databaseType === 'PostgreSQL';
  const showSqlServerInstance = databaseType === 'SQLServer';

  return (
    <>
      <div className="grid grid-cols-1 gap-x-4 gap-y-0 md:grid-cols-2">
        <Form.Item
          label="主机"
          name={['config', 'endpoint', 'host']}
          rules={databaseType === 'SQLite' ? [] : [{ required: true, message: '请输入主机' }]}
        >
          <Input
            placeholder={databaseType === 'SQLite' ? '可选，或仅填文件路径' : '主机名或 IP'}
            allowClear
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item label="端口" name={['config', 'endpoint', 'port']}>
          <InputNumber className="w-full!" min={1} max={65535} placeholder="默认端口可留空" />
        </Form.Item>
        <Form.Item label={databaseLabel} name={['config', 'endpoint', 'database']}>
          <Input allowClear autoComplete="off" />
        </Form.Item>
        {showSqlServerInstance ? (
          <Form.Item label="实例名" name={['config', 'extras', 'instanceName']}>
            <Input allowClear placeholder="可选" autoComplete="off" />
          </Form.Item>
        ) : null}
        {showSchema ? (
          <Form.Item label="Schema" name={['config', 'endpoint', 'schema']}>
            <Input allowClear placeholder="如 public" autoComplete="off" />
          </Form.Item>
        ) : null}
        {showOracleIds ? (
          <>
            <Form.Item label="Service Name" name={['config', 'endpoint', 'serviceName']}>
              <Input allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item label="SID" name={['config', 'endpoint', 'sid']}>
              <Input allowClear autoComplete="off" />
            </Form.Item>
          </>
        ) : null}
        <Form.Item label="用户名" name={['config', 'endpoint', 'username']}>
          <Input allowClear autoComplete="off" />
        </Form.Item>
        <Form.Item
          label="密码"
          name={['config', 'endpoint', 'password']}
          rules={requirePassword ? [{ required: true, message: '请输入密码' }] : []}
        >
          <Input.Password placeholder="新增必填；编辑不改请保留占位符" autoComplete="new-password" />
        </Form.Item>
      </div>

      <Collapse
        bordered={false}
        className="bg-transparent!"
        items={[
          {
            key: 'advanced',
            label: '连接池与扩展',
            children: (
              <div className="grid grid-cols-1 gap-x-4 gap-y-0 md:grid-cols-2">
                <Form.Item label="最大活跃连接" name={['config', 'pool', 'maxActive']}>
                  <InputNumber className="w-full!" min={1} placeholder="可选" />
                </Form.Item>
                <Form.Item label="最大等待(ms)" name={['config', 'pool', 'maxWaitMs']}>
                  <InputNumber className="w-full!" min={0} placeholder="可选" />
                </Form.Item>
                <Form.Item label="初始连接数" name={['config', 'pool', 'initialSize']}>
                  <InputNumber className="w-full!" min={0} placeholder="默认 0" />
                </Form.Item>
                <Form.Item label="最小空闲连接" name={['config', 'pool', 'minIdle']}>
                  <InputNumber className="w-full!" min={0} placeholder="默认 0" />
                </Form.Item>
                <Form.Item label="空闲检测间隔(ms)" name={['config', 'pool', 'timeBetweenEvictionRunsMs']}>
                  <InputNumber className="w-full!" min={1000} placeholder="如 60000" />
                </Form.Item>
                <Form.Item label="最小空闲驱逐(ms)" name={['config', 'pool', 'minEvictableIdleTimeMs']}>
                  <InputNumber className="w-full!" min={1000} placeholder="如 300000" />
                </Form.Item>
                <Form.Item label="校验 SQL" name={['config', 'pool', 'validationQuery']}>
                  <Input placeholder="如 SELECT 1" allowClear />
                </Form.Item>
                <Form.Item label="校验超时(秒)" name={['config', 'pool', 'validationQueryTimeoutSec']}>
                  <InputNumber className="w-full!" min={1} placeholder="可选" />
                </Form.Item>
                <Form.Item label="空闲时校验" name={['config', 'pool', 'testWhileIdle']} valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="借出时校验" name={['config', 'pool', 'testOnBorrow']} valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="归还时校验" name={['config', 'pool', 'testOnReturn']} valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="启用 SSL" name={['config', 'extras', 'useSsl']} valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="JDBC 附加参数" name={['config', 'extras', 'jdbcParams']}>
                  <Input placeholder="如 useUnicode=true&characterEncoding=UTF-8" allowClear />
                </Form.Item>
              </div>
            ),
          },
        ]}
      />
    </>
  );
});

ConnectionConfigFields.displayName = 'ConnectionConfigFields';

export default ConnectionConfigFields;

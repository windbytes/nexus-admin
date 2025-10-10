import type { FormSchemaField } from '../src/services/integrated/endpoint/endpointApi';

/**
 * HTTP端点配置Schema
 */
export const httpEndpointSchema: FormSchemaField[] = [
  {
    field: 'url',
    label: 'URL地址',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入URL地址，如：https://api.example.com/users',
    },
    rules: [
      { required: true, message: '请输入URL地址' },
      { type: 'url', message: '请输入有效的URL' },
    ],
  },
  {
    field: 'method',
    label: '请求方法',
    component: 'Select',
    required: true,
    defaultValue: 'GET',
    componentProps: {
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' },
      ],
    },
  },
  {
    field: 'authType',
    label: '认证方式',
    component: 'Select',
    defaultValue: 'none',
    componentProps: {
      options: [
        { label: '无认证', value: 'none' },
        { label: 'Basic Auth', value: 'basic' },
        { label: 'Bearer Token', value: 'bearer' },
        { label: 'OAuth 2.0', value: 'oauth2' },
        { label: 'API Key', value: 'apikey' },
      ],
    },
  },
  {
    field: 'timeout',
    label: '超时时间(ms)',
    component: 'InputNumber',
    defaultValue: 30000,
    componentProps: {
      min: 0,
      max: 300000,
      step: 1000,
      style: { width: '100%' },
    },
  },
  {
    field: 'retryTimes',
    label: '重试次数',
    component: 'InputNumber',
    defaultValue: 0,
    componentProps: {
      min: 0,
      max: 10,
      style: { width: '100%' },
    },
  },
  {
    field: 'responseType',
    label: '响应类型',
    component: 'Select',
    defaultValue: 'json',
    componentProps: {
      options: [
        { label: 'JSON', value: 'json' },
        { label: 'XML', value: 'xml' },
        { label: 'Text', value: 'text' },
        { label: 'Binary', value: 'binary' },
      ],
    },
  },
];

/**
 * 数据库端点配置Schema
 */
export const databaseEndpointSchema: FormSchemaField[] = [
  {
    field: 'databaseType',
    label: '数据库类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: 'MySQL', value: 'mysql' },
        { label: 'Oracle', value: 'oracle' },
        { label: 'SQL Server', value: 'sqlserver' },
        { label: 'PostgreSQL', value: 'postgresql' },
        { label: 'MongoDB', value: 'mongodb' },
      ],
    },
  },
  {
    field: 'host',
    label: '主机地址',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入主机地址，如：localhost 或 192.168.1.100',
    },
  },
  {
    field: 'port',
    label: '端口',
    component: 'InputNumber',
    required: true,
    defaultValue: 3306,
    componentProps: {
      min: 1,
      max: 65535,
      style: { width: '100%' },
    },
  },
  {
    field: 'databaseName',
    label: '数据库名',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入数据库名',
    },
  },
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入用户名',
    },
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true,
    componentProps: {
      placeholder: '请输入密码',
    },
  },
  {
    field: 'sqlType',
    label: 'SQL类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '查询(SELECT)', value: 'select' },
        { label: '插入(INSERT)', value: 'insert' },
        { label: '更新(UPDATE)', value: 'update' },
        { label: '删除(DELETE)', value: 'delete' },
        { label: '存储过程', value: 'procedure' },
        { label: '函数', value: 'function' },
      ],
    },
  },
  {
    field: 'sqlTemplate',
    label: 'SQL模板',
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入SQL语句，支持参数占位符：${paramName}',
      rows: 6,
    },
  },
];

/**
 * WebService端点配置Schema
 */
export const webserviceEndpointSchema: FormSchemaField[] = [
  {
    field: 'wsdlUrl',
    label: 'WSDL地址',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入WSDL地址',
    },
  },
  {
    field: 'serviceName',
    label: '服务名',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入服务名',
    },
  },
  {
    field: 'portName',
    label: '端口名',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入端口名',
    },
  },
  {
    field: 'operationName',
    label: '操作名',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入操作名',
    },
  },
  {
    field: 'soapVersion',
    label: 'SOAP版本',
    component: 'Radio',
    defaultValue: '1.1',
    componentProps: {
      options: [
        { label: 'SOAP 1.1', value: '1.1' },
        { label: 'SOAP 1.2', value: '1.2' },
      ],
    },
  },
  {
    field: 'timeout',
    label: '超时时间(ms)',
    component: 'InputNumber',
    defaultValue: 30000,
    componentProps: {
      min: 0,
      max: 300000,
      step: 1000,
      style: { width: '100%' },
    },
  },
];

/**
 * 文件端点配置Schema
 */
export const fileEndpointSchema: FormSchemaField[] = [
  {
    field: 'fileType',
    label: '文件类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '本地文件', value: 'local' },
        { label: 'FTP', value: 'ftp' },
        { label: 'SFTP', value: 'sftp' },
        { label: 'HTTP', value: 'http' },
        { label: '对象存储(OSS)', value: 'oss' },
      ],
    },
  },
  {
    field: 'filePath',
    label: '文件路径',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入文件路径',
    },
  },
  {
    field: 'host',
    label: '主机地址',
    component: 'Input',
    componentProps: {
      placeholder: '请输入主机地址',
    },
  },
  {
    field: 'port',
    label: '端口',
    component: 'InputNumber',
    componentProps: {
      min: 1,
      max: 65535,
      style: { width: '100%' },
    },
  },
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户名',
    },
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    componentProps: {
      placeholder: '请输入密码',
    },
  },
  {
    field: 'encoding',
    label: '文件编码',
    component: 'Select',
    defaultValue: 'UTF-8',
    componentProps: {
      options: [
        { label: 'UTF-8', value: 'UTF-8' },
        { label: 'GBK', value: 'GBK' },
        { label: 'GB2312', value: 'GB2312' },
        { label: 'ISO-8859-1', value: 'ISO-8859-1' },
      ],
    },
  },
  {
    field: 'parseType',
    label: '解析类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '纯文本', value: 'text' },
        { label: 'JSON', value: 'json' },
        { label: 'XML', value: 'xml' },
        { label: 'CSV', value: 'csv' },
        { label: 'Excel', value: 'excel' },
        { label: '二进制', value: 'binary' },
      ],
    },
  },
];

/**
 * 定时器端点配置Schema
 */
export const timerEndpointSchema: FormSchemaField[] = [
  {
    field: 'scheduleType',
    label: '调度类型',
    component: 'Radio',
    required: true,
    defaultValue: 'cron',
    componentProps: {
      options: [
        { label: 'Cron表达式', value: 'cron' },
        { label: '固定间隔', value: 'interval' },
        { label: '执行一次', value: 'once' },
      ],
    },
  },
  {
    field: 'cronExpression',
    label: 'Cron表达式',
    component: 'Input',
    componentProps: {
      placeholder: '请输入Cron表达式，如：0 0 12 * * ?',
    },
  },
  {
    field: 'intervalValue',
    label: '间隔值',
    component: 'InputNumber',
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    field: 'intervalUnit',
    label: '间隔单位',
    component: 'Select',
    componentProps: {
      options: [
        { label: '秒', value: 'second' },
        { label: '分钟', value: 'minute' },
        { label: '小时', value: 'hour' },
        { label: '天', value: 'day' },
      ],
    },
  },
  {
    field: 'startTime',
    label: '开始时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' },
    },
  },
  {
    field: 'endTime',
    label: '结束时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' },
    },
  },
  {
    field: 'maxExecutions',
    label: '最大执行次数',
    component: 'InputNumber',
    componentProps: {
      min: 1,
      style: { width: '100%' },
      placeholder: '不限制请留空',
    },
  },
  {
    field: 'concurrentEnabled',
    label: '允许并发执行',
    component: 'Switch',
    defaultValue: false,
  },
];

/**
 * MQ端点配置Schema
 */
export const mqEndpointSchema: FormSchemaField[] = [
  {
    field: 'mqType',
    label: 'MQ类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: 'RabbitMQ', value: 'rabbitmq' },
        { label: 'Kafka', value: 'kafka' },
        { label: 'ActiveMQ', value: 'activemq' },
        { label: 'RocketMQ', value: 'rocketmq' },
      ],
    },
  },
  {
    field: 'host',
    label: '主机地址',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入主机地址',
    },
  },
  {
    field: 'port',
    label: '端口',
    component: 'InputNumber',
    required: true,
    defaultValue: 5672,
    componentProps: {
      min: 1,
      max: 65535,
      style: { width: '100%' },
    },
  },
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户名',
    },
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    componentProps: {
      placeholder: '请输入密码',
    },
  },
  {
    field: 'queueName',
    label: '队列名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入队列名',
    },
  },
  {
    field: 'topicName',
    label: '主题名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入主题名',
    },
  },
  {
    field: 'exchangeName',
    label: '交换机名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入交换机名（RabbitMQ）',
    },
  },
];

/**
 * 端点Schema映射表
 */
export const endpointSchemaMap: Record<string, FormSchemaField[]> = {
  http: httpEndpointSchema,
  database: databaseEndpointSchema,
  webservice: webserviceEndpointSchema,
  file: fileEndpointSchema,
  timer: timerEndpointSchema,
  mq: mqEndpointSchema,
};

/**
 * 获取端点配置Schema（模拟后端接口）
 */
export const getEndpointConfigSchema = (endpointType: string): FormSchemaField[] => {
  return endpointSchemaMap[endpointType] || [];
};


/**
 * 定义流程支持的节点类型
 */
export const WorkflowNodeType = {
  // 注释节点
  Comment: 'comment',
  /************ 消息队列(activeMQ、rabbitMQ、rocketMQ、kafka、jms、AMQP、MQTT) *****************/
  // ActiveMQ节点
  ActiveMQ: 'activeMQ',
  // RabbitMQ节点
  RabbitMQ: 'rabbitMQ',
  // RocketMQ节点
  RocketMQ: 'rocketMQ',
  // Kafka节点
  Kafka: 'kafka',
  // JMS节点
  JMS: 'jms',
  // AMQP节点
  AMQP: 'amqp',
  // MQTT节点
  MQTT: 'mqtt',
  /************ web服务（HTTP、REST、SOAP、gRPC、CXF） *****************/
  // Http节点（外部调用节点）
  HTTP: 'http',
  // rest节点（服务暴露节点）
  REST: 'rest',
  // soap节点
  SOAP: 'soap',
  // grpc节点
  GRPC: 'grpc',
  // cxf节点
  CXF: 'cxf',
  /************ 数据存储（JDBC（目前先支持PG）、mongodb、ES、redis） *****************/
  // jdbc节点
  JDBC: 'jdbc',
  // mongodb节点
  MongoDB: 'mongodb',
  // ES节点
  ES: 'es',
  // redis节点
  Redis: 'redis',
  /************ 文件处理(file、ftp、sftp) *****************/
  // file节点
  File: 'file',
  // ftp节点
  FTP: 'ftp',
  // sftp节点
  SFTP: 'sftp',
  /************ 协议转换(json转xml, xml转json， XSLT转化， XML数字签名， XSD校验) *****************/
  // json转xml节点
  Json2Xml: 'json2Xml',
  // xml转json节点
  Xml2Json: 'xml2Json',
  // XSLT转化节点
  XSLT: 'xslt',
  // XML数字签名节点
  XmlSign: 'xmlSign',
  // XSD校验节点
  XSD: 'xsd',
  /************ 定时器 *****************/
  // 定时器节点
  Timer: 'timer',
  /************ 消息路由（filter、动态路由、splitter、aggregator、resequencer（重定序器）、composed message(消息组合)、multicast(组播)、loop(循环)） *****************/
  // filter节点
  Filter: 'filter',
  // 动态路由节点
  DynamicRouter: 'dynamicRouter',
  // splitter节点（消息拆分）
  Splitter: 'splitter',
  // aggregator节点（消息聚合）
  Aggregator: 'aggregator',
  // resequencer节点
  Resequencer: 'resequencer',
  // composed message节点
  ComposedMessage: 'composedMessage',
  // multicast节点
  Multicast: 'multicast',
  // loop节点
  Loop: 'loop',
  // 迭代
  Iterator: 'iterator',
  /************ 条件分支（choice、switch、when、otherwise、default、condition） *****************/
  // 条件节点
  Condition: 'condition',
  /************ 数据转化(base64、CSV、FHIR JSON、FHIR XML、crypto、HL7、JSON、protobuf、soap) *****************/
  // base64节点
  Base64: 'base64',
  // CSV节点
  CSV: 'csv',
  // FHIR JSON节点
  FHIRJson: 'fhirJson',
  // FHIR XML节点
  FHIRXml: 'fhirXml',
  // crypto节点
  Crypto: 'crypto',
  // HL7节点
  HL7: 'hl7',
  // JSON节点
  JSON: 'json',
  // protobuf节点
  Protobuf: 'protobuf',
  // soap节点
  SOAP_DATA: 'soap_data',
  /************ 表达式（bean、constant、file、groovy、header、java、HLT Terser、javascript、jOOR、jq、jsonPath、OGNL、python、XPATH、XQuery、wasm、variable） *****************/
  // bean节点
  Bean: 'bean',
  // groovy节点
  Groovy: 'groovy',
  // java节点
  Java: 'java',
  // HL7节点
  HLT_Terser: 'hltTerser',
  // javascript节点
  JavaScript: 'javascript',
  // jOOR节点
  JOOR: 'joor',
  // jq节点
  JQ: 'jq',
  // jsonPath节点
  JsonPath: 'jsonPath',
  // OGNL节点
  OGNL: 'ognl',
  // python节点
  Python: 'python',
  // XPATH节点
  XPATH: 'xpath',
  // XQuery节点
  XQuery: 'xquery',
  // wasm节点
  WASM: 'wasm',
  // variable节点
  Variable: 'variable',
  /************ 内容增强（enricher(内容增强器)、content filter(内容过滤器)、claim check(索赔检查)、normalizer(标准化器)、sort、script、validate） *****************/
  // enricher节点
  Enricher: 'enricher',
  // content filter节点
  ContentFilter: 'contentFilter',
  // claim check节点
  ClaimCheck: 'claimCheck',
  // normalizer节点
  Normalizer: 'normalizer',
  // sort节点
  Sort: 'sort',
  // script节点
  Script: 'script',
  // validate节点
  Validate: 'validate',
  /************ 消息头处理(remove header、remove headers、set header、 set headers) *****************/
  // remove header节点
  RemoveHeader: 'removeHeader',
  // remove headers节点
  RemoveHeaders: 'removeHeaders',
  // set header节点
  SetHeader: 'setHeader',
  // set headers节点
  SetHeaders: 'setHeaders',
  /************ 消息体处理(set body) *****************/
  // set body节点
  SetBody: 'setBody',
  /************ 错误处理 *****************/
  // 错误处理节点
  ErrorHandler: 'errorHandler',
  /************ 高级处理（限流） *****************/
  // 限流节点
  RateLimiter: 'rateLimiter',

  /************ 自定义节点 *****************/
  // 动态链接库
  DLL: 'dll',
  // 命令行
  CMD: 'cmd',
  // 邮件
  Mail: 'mail',
};

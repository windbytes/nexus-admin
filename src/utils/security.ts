/**
 * 安全工具函数
 * 提供 XSS 防护、输入验证等安全功能
 */

/**
 * HTML 转义函数，防止 XSS 攻击
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * 安全的 innerHTML 设置
 */
export const setSafeInnerHTML = (element: HTMLElement, html: string): void => {
  element.innerHTML = escapeHtml(html);
};

/**
 * 输入验证规则
 */
export const validationRules = {
  // 邮箱验证
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // 手机号验证（中国大陆）
  phone: /^1[3-9]\d{9}$/,
  
  // 密码强度验证（至少8位，包含大小写字母、数字和特殊字符）
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // 用户名验证（3-20位字母数字下划线）
  username: /^[a-zA-Z0-9_]{3,20}$/,
  
  // URL 验证
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // 身份证号验证（中国大陆）
  idCard: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
};

/**
 * 输入验证函数
 */
export const validateInput = {
  email: (email: string): boolean => validationRules.email.test(email),
  phone: (phone: string): boolean => validationRules.phone.test(phone),
  password: (password: string): boolean => validationRules.password.test(password),
  username: (username: string): boolean => validationRules.username.test(username),
  url: (url: string): boolean => validationRules.url.test(url),
  idCard: (idCard: string): boolean => validationRules.idCard.test(idCard),
  
  // 通用验证
  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },
  
  minLength: (value: string, min: number): boolean => value.length >= min,
  maxLength: (value: string, max: number): boolean => value.length <= max,
  
  // 数字范围验证
  numberRange: (value: number, min: number, max: number): boolean => 
    value >= min && value <= max,
  
  // 正则表达式验证
  pattern: (value: string, pattern: RegExp): boolean => pattern.test(value),
};

/**
 * 敏感信息脱敏
 */
export const maskSensitiveData = {
  // 手机号脱敏
  phone: (phone: string): string => {
    if (phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },
  
  // 邮箱脱敏
  email: (email: string): string => {
    const [username, domain] = email.split('@');
    if (username!.length <= 2) return email;
    const maskedUsername = username![0] + '*'.repeat(username!.length - 2) + username![username!.length - 1];
    return `${maskedUsername}@${domain}`;
  },
  
  // 身份证号脱敏
  idCard: (idCard: string): string => {
    if (idCard.length !== 18) return idCard;
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  },
  
  // 银行卡号脱敏
  bankCard: (cardNumber: string): string => {
    if (cardNumber.length < 8) return cardNumber;
    const start = cardNumber.slice(0, 4);
    const end = cardNumber.slice(-4);
    const middle = '*'.repeat(cardNumber.length - 8);
    return `${start}${middle}${end}`;
  },
  
  // 姓名脱敏
  name: (name: string): string => {
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  },
};

/**
 * CSRF 令牌生成和验证
 */
export const csrfToken = {
  // 生成 CSRF 令牌
  generate: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  // 验证 CSRF 令牌
  validate: (token: string, storedToken: string): boolean => {
    return token === storedToken && token.length === 64;
  },
  
  // 存储 CSRF 令牌到 sessionStorage
  store: (token: string): void => {
    sessionStorage.setItem('csrf-token', token);
  },
  
  // 从 sessionStorage 获取 CSRF 令牌
  get: (): string | null => {
    return sessionStorage.getItem('csrf-token');
  },
};

/**
 * 内容安全策略 (CSP) 配置
 */
export const cspConfig = {
  // 生成 CSP 头部
  generateHeader: (): string => {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
  },
};

/**
 * 安全存储工具
 * 提供加密的本地存储功能
 */
export const secureStorage = {
  // 简单的 Base64 编码（仅用于非敏感数据）
  encode: (data: string): string => {
    return btoa(unescape(encodeURIComponent(data)));
  },
  
  // Base64 解码
  decode: (encodedData: string): string => {
    try {
      return decodeURIComponent(escape(atob(encodedData)));
    } catch {
      return '';
    }
  },
  
  // 安全存储（编码后存储）
  setItem: (key: string, value: any): void => {
    try {
      const encodedValue = secureStorage.encode(JSON.stringify(value));
      localStorage.setItem(key, encodedValue);
    } catch (error) {
      console.error('安全存储失败:', error);
    }
  },
  
  // 安全获取（解码后获取）
  getItem: <T = any>(key: string): T | null => {
    try {
      const encodedValue = localStorage.getItem(key);
      if (!encodedValue) return null;
      
      const decodedValue = secureStorage.decode(encodedValue);
      return JSON.parse(decodedValue);
    } catch (error) {
      console.error('安全获取失败:', error);
      return null;
    }
  },
  
  // 删除安全存储项
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  // 清空安全存储
  clear: (): void => {
    localStorage.clear();
  },
};

/**
 * 输入清理函数
 * 清理用户输入，防止注入攻击
 */
export const sanitizeInput = {
  // 清理 HTML 标签
  stripHtml: (input: string): string => {
    return input.replace(/<[^>]*>/g, '');
  },
  
  // 清理 SQL 注入字符
  stripSql: (input: string): string => {
    return input.replace(/['"\\;]/g, '');
  },
  
  // 清理 JavaScript 代码
  stripScript: (input: string): string => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },
  
  // 清理所有危险字符
  stripDangerous: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // 移除 HTML 标签
      .replace(/['"\\;]/g, '') // 移除引号和分号
      .replace(/javascript:/gi, '') // 移除 javascript: 协议
      .replace(/on\w+\s*=/gi, '') // 移除事件处理器
      .trim();
  },
};

export default {
  escapeHtml,
  setSafeInnerHTML,
  validationRules,
  validateInput,
  maskSensitiveData,
  csrfToken,
  cspConfig,
  secureStorage,
  sanitizeInput,
};

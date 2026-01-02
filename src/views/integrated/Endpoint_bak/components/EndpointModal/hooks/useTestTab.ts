import { useCallback, useState } from 'react';
import type { KeyValuePair, UseTestTabReturn } from '../types';

/**
 * 测试 Tab Hook
 * 管理测试相关的状态和逻辑
 */
export const useTestTab = (): UseTestTabReturn => {
  const [headers, setHeaders] = useState<KeyValuePair[]>([{ key: '', value: '', id: Date.now().toString() }]);
  const [bodyContent, setBodyContent] = useState<string>('');
  const [requestContent, setRequestContent] = useState<string>('');
  const [responseContent, setResponseContent] = useState<string>('');

  /**
   * 添加键值对
   */
  const handleAddHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { key: '', value: '', id: Date.now().toString() }]);
  }, []);

  /**
   * 更新键值对
   */
  const handleHeaderChange = useCallback((id: string, field: 'key' | 'value', value: string) => {
    setHeaders((prev) => prev.map((header) => (header.id === id ? { ...header, [field]: value } : header)));
  }, []);

  /**
   * 删除键值对
   */
  const handleRemoveHeader = useCallback((id: string) => {
    setHeaders((prev) => {
      if (prev.length > 1) {
        return prev.filter((header) => header.id !== id);
      }
      return prev;
    });
  }, []);

  return {
    headers,
    bodyContent,
    requestContent,
    responseContent,
    handleAddHeader,
    handleHeaderChange,
    handleRemoveHeader,
    setBodyContent,
    setRequestContent,
    setResponseContent,
  };
};

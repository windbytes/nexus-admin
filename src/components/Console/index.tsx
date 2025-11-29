
import type React from 'react';
import { useEffect, useState } from 'react';

import webSocketClient from '@/utils/webscoketClient';
import DragModal from '@/components/modal/DragModal';

/**
 * 弹窗监控台
 * @returns
 */
const Console: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  // 控制台需要显示的消息
  const [message, setMessage] = useState<string[]>([]);

  useEffect(() => {
    // 初始化的时候绑定键盘事件
    document.addEventListener('keyup', keyupEvent, false);
    // 初始化websocket
    webSocketClient.on('SQL', (data: string) => {
      console.log('收到的消息：', data);
      // 需要判断窗口是否打开状态
    });

    return () => {
      // 销毁键盘事件
      document.removeEventListener('keyup', keyupEvent, false);
    };
  }, []);


  /**
   * 监听键盘事件
   * @param e
   */
  const keyupEvent = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      setOpen(false);
    }
    if (e.ctrlKey && e.code === 'F11') {
      setOpen(true);
    }
  };

  return (
    <DragModal
      open={open}
      classNames={{
        wrapper: 'position-unset!',
        container: 'absolute! top-14! right-[26px]! z-1000!',
        body: 'h-[calc(100vh-160px)]! border-1! border-solid! border-gray-200! p-2! rounded-md! bg-aliceblue!',
      }}
      title="监控台（Esc关闭）"
      width={380}
      footer={null}
      onCancel={() => setOpen(false)}
    >
      {message}
      console监控台，这里填写监控到的执行的SQL
    </DragModal>
  );
};
export default Console;

import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';

type ModalInstance = Omit<ModalStaticFunctions, 'warn'>;

/**
 * 保存 antd App 注入的实例，供非 React 组件文件消费。
 */
class AntdUtils {
  message: MessageInstance | null = null;
  notification: NotificationInstance | null = null;
  modal: ModalInstance | null = null;

  setMessageInstance(message: MessageInstance) {
    this.message = message;
  }

  setNotificationInstance(notification: NotificationInstance) {
    this.notification = notification;
  }

  setModalInstance(modal: ModalInstance) {
    this.modal = modal;
  }
}

export const antdUtils = new AntdUtils();

import { Avatar, Button, Empty, Space, Tag, Typography } from 'antd';
import type React from 'react';
import styles from './message-box.module.scss';
import classNames from '@/utils/classnames';

/**
 * 消息列表
 * @param props 
 * @returns
 */
const MessageList: React.FC<MessageListProps> = (props) => {
  const { data, unReadData } = props;

  /**
   * 列表项点击事件
   * @param item 点击项
   * @param index 序号
   */
  const onItemClick = (item: MessageItemData, index: number) => {
    if (props.onItemClick) {
      props.onItemClick(item, index);
    }
  };

  /**
   * 全部已读点击事件
   */
  const onAllBtnClick = () => {
    if (props.onAllBtnClick) {
      props.onAllBtnClick(unReadData, data);
    }
  };

  if (!data || data.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无消息" />;
  }

  return (
    <div className={styles['message-list-container']}>
      <div className={styles['message-list']}>
        {data.map((item, index) => (
          <div
            key={item.id}
            className={classNames(styles['message-item'], item.status && 'opacity-50')}
            onClick={() => onItemClick(item, index)}
          >
            <div className={styles['message-item-content']}>
              {item.avatar && (
                <div className={styles['message-avatar']}>
                  <Avatar shape="circle" size={36}>
                    <img src={item.avatar} alt="" />
                  </Avatar>
                </div>
              )}
              <div className={styles['message-item-body']}>
                <div className={styles['message-title']}>
                  <Space size={4}>
                    <span>{item.title}</span>
                    <Typography.Text type="secondary">
                      {item.subTitle}
                    </Typography.Text>
                  </Space>
                  {item.tag?.text ? (
                    <Tag color={item.tag.color}>{item.tag.text}</Tag>
                  ) : null}
                </div>
                <div className={styles['message-description']}>
                  <Typography.Paragraph className="mb-0" ellipsis>
                    {item.content}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary" className="text-xs">
                    {item.time}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles['footer']}>
        <div className={styles['footer-item']}>
          <Button type="text" size="small" onClick={onAllBtnClick}>
            全部已读
          </Button>
        </div>
        <div className={styles['footer-item']}>
          <Button type="text" size="small">
            查看更多
          </Button>
        </div>
      </div>
    </div>
  );
};
export default MessageList;

/**
 * 列表项数据
 */
export interface MessageItemData {
  id: string;
  title: string;
  type: string;
  subTitle?: string;
  avatar?: string;
  content: string;
  time?: string;
  status: number;
  tag?: {
    text?: string;
    color?: string;
  };
}

// 列表类型
export type MessageListType = MessageItemData[];

/**
 * 消息列表参数
 */
interface MessageListProps {
  // 列表数据
  data: MessageItemData[];
  // 未读消息
  unReadData: MessageItemData[];
  // 点击事件
  onItemClick?: (item: MessageItemData, index: number) => void;
  // 全部已读
  onAllBtnClick?: (
    unReadData: MessageItemData[],
    data: MessageItemData[],
  ) => void;
}

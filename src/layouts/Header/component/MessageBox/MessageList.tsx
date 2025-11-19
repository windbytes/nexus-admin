import { Avatar, Button, Empty, List, Space, Tag, Typography } from 'antd';
import type React from 'react';
import type { ReactNode } from 'react';
import styles from './message-box.module.scss';

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

  /**
   * 渲染列表
   */
  const renderList = (item: MessageItemData, index: number): ReactNode => {
    return (
      <List.Item
        key={item.id}
        style={{ opacity: item.status ? 0.5 : 1, cursor: 'pointer', flex: 1 }}
        onClick={() => onItemClick(item, index)}
      >
        <List.Item.Meta
          avatar={
            item.avatar && (
              <Avatar shape="circle" size={36}>
                <img src={item.avatar} alt="" />
              </Avatar>
            )
          }
          title={
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
          }
          description={
            <div>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>
                {item.content}
              </Typography.Paragraph>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {item.time}
              </Typography.Text>
            </div>
          }
        />
      </List.Item>
    );
  };

  return !data || data.length === 0 ? (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无消息" />
  ) : (
    <List
      footer={
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
      }
      dataSource={data}
      renderItem={renderList}
    />
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

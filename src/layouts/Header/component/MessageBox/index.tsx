import { MessageOutlined, NotificationOutlined, ReconciliationOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { Button, Card, Spin, Tabs, type TabsProps } from 'antd';
import { groupBy } from 'lodash-es';
import type React from 'react';
import { useEffect, useState } from 'react';
import styles from './message-box.module.scss';
import MessageList, { type MessageListType } from './MessageList';
/**
 * 通知模块
 */
const Notify: React.FC = () => {
  // 列表加载状态
  const [loading, setLoading] = useState<boolean>(false);

  // 列表数据(按分类放好的)
  const [groupData, setGroupData] = useState<{
    [key: string]: MessageListType;
  }>({});
  // 原始数据
  const [dataSource, setDataSource] = useState<MessageListType>([]);

  // 加载数据
  useEffect(() => {
    setLoading(true);

    // 模拟取数据
    setTimeout(() => {
      // 模拟从后台取数据
      setDataSource([
        {
          id: '1',
          title: '您有新的待办',
          content: '您有新的待办',
          type: 'message',
          time: '2023-01-01 12:00:00',
          status: 0,
        },
        {
          id: '2',
          title: '您有新的待办',
          content: '您有新的待办',
          type: 'todo',
          status: 1,
        },
      ]);
      // 取消加载状态
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // 数据加载完成后将数据进行分组
    const groupData: { [key: string]: MessageListType } = groupBy(dataSource, 'type');
    setGroupData(groupData);
  }, [dataSource]);

  /**
   * 标记消息已读
   * @param data 消息数据
   */
  const readMessage = (data: MessageListType) => {
    console.log('标记消息已读', data);
  };

  // tab列表
  const tabList: TabsProps['items'] = [
    {
      key: 'message',
      label: <>消息({groupData['message']?.length || 0})</>,
      icon: <MessageOutlined className='mr-2!'/>,
      children: (
        <MessageList
          data={groupData['message'] || []}
          unReadData={(groupData['message'] || []).filter((item) => !item.status)}
          onItemClick={(item) => readMessage([item])}
          onAllBtnClick={(unReadData) => readMessage(unReadData)}
        />
      ),
    },
    {
      key: 'notify',
      label: <>通知({groupData['notify']?.length || 0})</>,
      icon: <NotificationOutlined className='mr-2!'/>,
      children: (
        <MessageList
          data={groupData['notify'] || []}
          unReadData={(groupData['notify'] || []).filter((item) => !item.status)}
          onItemClick={(item) => readMessage([item])}
          onAllBtnClick={(unReadData) => readMessage(unReadData)}
        />
      ),
    },
    {
      key: 'todo',
      label: <>待办({groupData['todo']?.length || 0})</>,
      icon: <ReconciliationOutlined className='mr-2!'/>,
      children: (
        <MessageList
          data={groupData['todo'] || []}
          unReadData={(groupData['todo'] || []).filter((item) => !item.status)}
          onItemClick={(item) => readMessage([item])}
          onAllBtnClick={(unReadData) => readMessage(unReadData)}
        />
      ),
    },
  ];

  return (
    <Card className={styles['message-box']} styles={{ body: { height: '100%', padding: '12px' } }}>
      <Spin
        spinning={loading}
        indicator={<Icon icon="eos-icons:bubble-loading" width={24} />}
        style={{ display: 'block' }}
      >
        <Tabs
          items={tabList}
          defaultActiveKey="message"
          size="small"
          style={{ height: '100%' }}
          tabBarExtraContent={
            <Button
              type="link"
              onClick={() => {
                console.log('清除');
              }}
            >
              清空
            </Button>
          }
        />
      </Spin>
    </Card>
  );
};
export default Notify;

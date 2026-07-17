import { LoadingOutlined, MessageOutlined, NotificationOutlined, ReconciliationOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Tabs, type TabsProps } from 'antd';
import { groupBy } from 'lodash-es';
import { useEffect, useState } from 'react';
import MessageList, { type MessageListType } from './MessageList';
import styles from './message-box.module.css';

/**
 * 通知模块
 */
function Notify() {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<MessageListType>([]);
  const groupData: { [key: string]: MessageListType } = groupBy(dataSource, 'type');

  useEffect(() => {
    const timerId = window.setTimeout(() => {
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
      setLoading(false);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, []);

  const readMessage = (data: MessageListType) => {
    console.log('标记消息已读', data);
  };

  const tabList: TabsProps['items'] = [
    {
      key: 'message',
      label: <>消息({groupData['message']?.length || 0})</>,
      icon: <MessageOutlined className="mr-2!" />,
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
      icon: <NotificationOutlined className="mr-2!" />,
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
      icon: <ReconciliationOutlined className="mr-2!" />,
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
    <Card
      className={styles['message-box']}
      classNames={{
        body: 'h-full p-3',
      }}
    >
      <Spin spinning={loading} indicator={<LoadingOutlined width={24} />} className="block">
        <Tabs
          items={tabList}
          defaultActiveKey="message"
          size="small"
          className="h-full"
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

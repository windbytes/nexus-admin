import {
  ClearOutlined,
  CloseOutlined,
  CopyOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import type React from "react";
import { memo, useMemo, useState } from "react";
import {
  App,
  Button,
  ConfigProvider,
  Drawer,
  Segmented,
  Space,
  Tabs,
  type TabsProps,
} from "antd";
import { usePreferencesStore } from "@/stores/store";
import Block from "./Block";
import Theme from "./Theme";
import Layout from "./Layout";
import Shortcut from "./Shortcut";
import General from "./Common/General";
import Animation from "./Common/Animation";

/**
 * 系统设置界面组件的属性配置
 */
export interface SettingProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/* 系统配置界面 */
const Setting: React.FC<SettingProps> = ({ open, setOpen }) => {
  // 从全局状态库中获取数据
  const resetPreferences = usePreferencesStore(
    (state) => state.resetPreferences
  );
  const [selectedKey, setSelectedKey] = useState<string>("theme");
  const { modal, message } = App.useApp();

  // 分段器的值
  const segmentedItems = useMemo(() => {
    return [
      {
        label: "外观",
        value: "theme",
      },
      {
        label: "布局",
        value: "layout",
      },
      {
        label: "快捷键",
        value: "shortcut",
      },
      {
        label: "通用",
        value: "common",
      },
    ];
  }, []);

  // Tabs的选项
  const tabsItems: TabsProps["items"] = [
    {
      key: "theme",
      label: "",
      children: <Theme />,
    },
    {
      key: "layout",
      label: "",
      children: <Layout />,
    },
    {
      key: "shortcut",
      label: "",
      children: (
        <Block title="全局">
          <Shortcut />
        </Block>
      ),
    },
    {
      key: "common",
      label: "",
      children: (
        <>
          <Block title="通用">
            <General />
          </Block>
          <Block title="动画">
            <Animation />
          </Block>
        </>
      ),
    },
  ];

  /**
   * 重置所有偏好设置
   */
  const resetPreference = () => {
    modal.confirm({
      title: "重置偏好设置",
      content: "重置所有偏好设置？重置后系统偏好设置将恢复为默认状态！",
      onOk: () => {
        resetPreferences();
        message.success("偏好设置已重置");
      },
    });
  };

  return (
    <Drawer
      title={
        <div
          className="title text-[16px] font-normal"
        >
          <h2 className="m-0 text-left font-500">
            偏好设置
          </h2>
          <p
            className="subTitle text-xs leading-4 mt-1 mb-0"
          >
            自定义偏好设置 & 实时预览
          </p>
        </div>
      }
      extra={
        <Space size={16}>
          <RedoOutlined className="cursor-pointer" />
          <CloseOutlined onClick={() => setOpen(false)} />
        </Space>
      }
      classNames={{
        header: 'px-3! py-4!',
        body: 'p-3!'
      }}
      placement="right"
      open={open}
      closeIcon={false}
      footer={
        <div className="w-full flex justify-evenly items-center">
          <Button type="primary" icon={<CopyOutlined />} disabled>
            复制偏好设置
          </Button>
          <Button
            icon={<ClearOutlined />}
            type="primary"
            danger
            onClick={resetPreference}
          >
            重置偏好设置
          </Button>
        </div>
      }
      onClose={() => setOpen(false)}
    >
      {/* Segmented */}
      <ConfigProvider
        theme={{ components: { Segmented: { trackPadding: "4px" } } }}
      >
        <Segmented
          block
          options={segmentedItems}
          onChange={(key: string) => {
            setSelectedKey(key);
          }}
          value={selectedKey}
        />
      </ConfigProvider>
      {/* Tabs */}
      <Tabs
        activeKey={selectedKey}
        items={tabsItems}
        tabBarStyle={{ marginBottom: "8px" }}
      />
    </Drawer>
  );
};

export default memo(Setting);

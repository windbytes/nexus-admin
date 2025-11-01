import { LeftOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";

import WorkflowEditor from "@/components/workflow";
import { usePreferencesStore } from "@/stores/store";
import NodeAddPanel from "./node-add-panel";
import "./workflow.module.scss";

/**
 * 流程编排
 * @returns
 */
const Workflow: React.FC = () => {
  // 获取主题配置
  const colorPrimary = usePreferencesStore(
    (state) => state.preferences.theme.colorPrimary
  );
  // 获取路由参数（应用ID）
  const { appId } = useParams();
  // 路由跳转
  const navigate = useNavigate();

  const redirectApps = () => {
    navigate({ to: "/integrated/apps" });
  };

  useEffect(() => {
    // 监听主题变化
    document.documentElement.style.setProperty(
      "--g-workflow-line-color-flowing",
      colorPrimary
    );
    document.documentElement.style.setProperty(
      "--g-workflow-port-color-secondary",
      colorPrimary
    );
  }, [colorPrimary]);

  return (
    <div className="w-full flex h-full">
      <Card
        className="w-[220px] h-full flex flex-col justify-between bg-white"
        classNames={{ body: "w-full h-full p-2! flex flex-col" }}
      >
        <div className="flex justify-center align-middle">
          <Button type="default" onClick={redirectApps} icon={<LeftOutlined />}>
            应用中心
          </Button>
        </div>
        <NodeAddPanel />
      </Card>

      <div className="w-full flex flex-auto relative">
        {/* 画布 */}
        <WorkflowEditor id={appId} />
      </div>
    </div>
  );
};
export default Workflow;

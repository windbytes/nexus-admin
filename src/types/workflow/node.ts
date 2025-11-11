import type {
  FlowNodeEntity,
  WorkflowNodeJSON as FlowNodeJsonDefault,
  WorkflowNodeRegistry as FlowNodeRegistryDefault,
  FreeLayoutPluginContext,
  WorkflowEdgeJSON,
  WorkflowNodeMeta,
} from '@flowgram.ai/free-layout-editor';

/**
 * 自定义的节点数据结构
 */
export interface FlowNodeJSON extends FlowNodeJsonDefault {
  data: {
    /**
     * 节点标题
     */
    title?: string;
    /**
     * 其他属性
     */
    [key: string]: any;
  };
}

/**
 * 自定义的节点的meta数据（ui相关的部分）
 * 例如节点位置，大小，其他属性
 */
export interface FlowNodeMeta extends WorkflowNodeMeta {
  // 是否禁用侧边栏
  // 例如文本节点，图片节点等不需要显示侧边栏
  disableSideBar?: boolean;
  // 是否禁用弹窗（某些节点双击的时候不需要弹窗）
  disableModal?: boolean;
}

/**
 * 定义节点的注册器
 * 用于确定节点的类型以及渲染方式
 * 不同的节点类型可以有不同的渲染方式，例如文本节点，图片节点，视频节点等
 *
 */
export interface FlowNodeRegistry extends FlowNodeRegistryDefault {
  meta: WorkflowNodeMeta;

  info?: {
    icon: string;
    description: string;
  };
  canAdd?: (ctx: FreeLayoutPluginContext) => boolean;
  canDelete?: (ctx: FreeLayoutPluginContext, from: FlowNodeEntity) => boolean;
  onAdd?: (ctx: FreeLayoutPluginContext) => FlowNodeJSON;
  // 节点双击事件
  // 用于打开节点的配置面板等
  onDblClick?: (ctx: FreeLayoutPluginContext, node: FlowNodeEntity) => void;
}

/**
 * 定义的流程的json数据结构
 */
export interface FlowDocumentJSON {
  nodes: FlowNodeJSON[];
  edges: WorkflowEdgeJSON[];
}

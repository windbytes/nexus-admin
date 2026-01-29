import { ContainerUtils } from '@flowgram.ai/free-container-plugin';
import {
  FreeLayoutPluginContext,
  inject,
  injectable,
  Layer,
  type PositionSchema,
  WorkflowDocument,
  WorkflowDragService,
  WorkflowHoverService,
  type WorkflowNodeEntity,
  type WorkflowNodeJSON,
  WorkflowSelectService,
} from '@flowgram.ai/free-layout-editor';
import { type NodePanelResult, WorkflowNodePanelService } from '@flowgram.ai/free-node-panel-plugin';

/**
 * 右键菜单图层
 * 除节点上右键外的其他地方右键操作，出现例如添加节点的菜单面板（包括导出、导入、运行等）
 */
@injectable()
export class ContextMenuLayer extends Layer {
  /**
   * 上下文
   */
  @inject(FreeLayoutPluginContext) ctx: FreeLayoutPluginContext;

  /**
   * 注入节点窗口服务
   */
  @inject(WorkflowNodePanelService) nodePanelService: WorkflowNodePanelService;

  /**
   * 注入hover服务
   */
  @inject(WorkflowHoverService) hoverService: WorkflowHoverService;

  /**
   * 注入选择服务
   */
  @inject(WorkflowSelectService) selectService: WorkflowSelectService;

  /**
   * 注入流程文档对象
   */
  @inject(WorkflowDocument) document: WorkflowDocument;

  /**
   * 注入拖拽服务
   */
  @inject(WorkflowDragService) dragService: WorkflowDragService;

  /**
   * 初始化时候触发
   */
  override onReady(): void {
    // 监听右键菜单事件
    this.listenPlaygroundEvent('contextmenu', (e) => {
      if (this.config.readonlyOrDisabled) {
        return;
      }
      this.openNodePanel(e);
      // 阻止默认事件
      e.preventDefault();
      // 阻止事件冒泡
      e.stopPropagation();
    });
  }

  /**
   * 打开右键菜单面板
   * @param e 鼠标事件
   */
  openNodePanel(e: MouseEvent) {
    const pos = this.getPosFromMouseEvent(e);
    const containerNode = this.getContainerNode(pos);
    // 调用节点窗口服务
    this.nodePanelService.callNodePanel({
      position: pos,
      containerNode,
      panelProps: {},
      onSelect: async (panelParams?: NodePanelResult) => {
        if (!panelParams) {
          return;
        }
        const { nodeType, nodeJSON } = panelParams;
        // 根据选择的类型创建新的工作流节点
        const node: WorkflowNodeEntity = this.ctx.document.createWorkflowNodeByType(
          nodeType,
          pos,
          nodeJSON ?? ({} as WorkflowNodeJSON),
          containerNode?.id
        );
        // 选中节点
        this.selectService.selectNode(node);
      },
      onClose: () => {},
    });
  }

  /**
   * 获取容器节点
   * @param mousePos 鼠标位置
   * @returns 容器节点
   */
  private getContainerNode(mousePos: PositionSchema): WorkflowNodeEntity | undefined {
    const allNodes = this.document.getAllNodes();
    const containerTransforms = ContainerUtils.getContainerTransforms(allNodes);
    // 获取重叠位置
    const collisionTransform = ContainerUtils.getCollisionTransform({
      targetPoint: mousePos,
      transforms: containerTransforms,
      document: this.document,
    });
    return collisionTransform?.entity;
  }
}

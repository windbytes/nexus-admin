import {
  FreeLayoutPluginContext,
  Layer,
  WorkflowHoverService,
  type WorkflowNodeEntity,
  type WorkflowNodeJSON,
} from '@flowgram.ai/free-layout-editor';
import {
  type NodePanelResult,
  WorkflowNodePanelService,
} from '@flowgram.ai/free-node-panel-plugin';

/**
 * 右键菜单图层
 */
export class ContextMenuLayer extends Layer {
  ctx: FreeLayoutPluginContext;
  nodePanelService: WorkflowNodePanelService;
  hoverService: WorkflowHoverService;

  constructor(
    ctx: FreeLayoutPluginContext,
    nodePanelService: WorkflowNodePanelService,
    hoverService: WorkflowHoverService
  ) {
    super();
    this.ctx = ctx;
    this.nodePanelService = nodePanelService;
    this.hoverService = hoverService;
  }

  override onReady(): void {
    this.listenPlaygroundEvent('contextmenu', (e) => {
      this.openNodePanel(e);
      e.preventDefault();
      e.stopPropagation();
    });
  }

  openNodePanel(e: MouseEvent) {
    const pos = this.getPosFromMouseEvent(e);
    this.nodePanelService.callNodePanel({
      position: pos,
      panelProps: {},
      // handle node selection from panel - 处理从面板中选择节点
      onSelect: async (panelParams?: NodePanelResult) => {
        if (!panelParams) {
          return;
        }
        const { nodeType, nodeJSON } = panelParams;
        // create new workflow node based on selected type - 根据选择的类型创建新的工作流节点
        const node: WorkflowNodeEntity =
          this.ctx.document.createWorkflowNodeByType(
            nodeType,
            pos,
            nodeJSON ?? ({} as WorkflowNodeJSON),
          );
        // select the newly created node - 选择新创建的节点
        this.ctx.selection.selection = [node];
      },
      // handle panel close - 处理面板关闭
      onClose: () => {},
    });
  }
}

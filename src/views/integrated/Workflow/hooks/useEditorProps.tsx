import { WorkflowNodeType } from '@/components/workflow/nodes/constants';
import type { FlowDocumentJSON, FlowNodeRegistry } from '@/types/workflow/node';
import { DeleteOutlined, PlayCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { createFreeAutoLayoutPlugin } from '@flowgram.ai/free-auto-layout-plugin';
import { createContainerNodePlugin } from '@flowgram.ai/free-container-plugin';
import { createFreeGroupPlugin } from '@flowgram.ai/free-group-plugin';
import {
  FlowNodeBaseType,
  FreeLayoutPluginContext,
  WorkflowNodeEntity,
  type FreeLayoutProps,
} from '@flowgram.ai/free-layout-editor';
import { createFreeLinesPlugin } from '@flowgram.ai/free-lines-plugin';
import { createFreeNodePanelPlugin } from '@flowgram.ai/free-node-panel-plugin';
import { createFreeSnapPlugin } from '@flowgram.ai/free-snap-plugin';
import { createFreeStackPlugin } from '@flowgram.ai/free-stack-plugin';
import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { createPanelManagerPlugin } from '@flowgram.ai/panel-manager-plugin';
import { debounce } from 'lodash-es';
import { useMemo } from 'react';
import BaseNode from '../components/base-node';
import { CommentRender } from '../components/comment/components/render';
import { GroupNodeRender } from '../components/group/components/node-render';
import { LineDeleteButton } from '../components/line-delete-button';
import { NodePanel } from '../components/node-panel';
import SelectBoxPopover from '../components/select-box-popover';
import { nodeFormPanelFactory } from '../components/sidebar';
import { DefaultNode } from '../nodes/defaultNode';
import { createContextMenuPlugin } from '../plugins/context-menu-plugin/context-menu-plugin';
import { CustomService } from '../services/custom-service';
import { shortcuts } from '../shortcuts/shortcuts';

/**
 * 定义流程编辑器的配置属性钩子函数
 * @param initialData 初始数据
 * @param nodeRegistries 节点注册
 * @param handleSave 保存回调
 * @returns 返回流程编辑器的配置属性
 */
export function useEditorProps(
  initialData: FlowDocumentJSON,
  nodeRegistries: FlowNodeRegistry[],
  handleSave?: (data: FlowDocumentJSON) => void
): FreeLayoutProps {
  return useMemo(
    () => ({
      /**
       * 支持背景
       */
      background: {
        enabled: true,
        logo: {
          text: 'NEXUS',
          position: 'center',
          size: 400,
          opacity: 1,
          color: '#fff',
          // 字体
          fontFamily: 'Arial, sans-serif',

          // 字体粗细
          fontWeight: 'bold',

          // 自定义偏移量
          offset: { x: 0, y: 0 },
          neumorphism: {
            // 启用新拟态效果
            enabled: true,

            // 文字颜色
            textColor: '#E0E0E0',

            // 高光阴影颜色
            lightShadowColor: 'rgba(255,255,255,0.9)',

            // 暗色阴影颜色
            darkShadowColor: 'rgba(0,0,0,0.15)',

            // 阴影偏移距离
            shadowOffset: 6,

            // 阴影模糊半径
            shadowBlur: 12,

            // 阴影强度
            intensity: 0.6,

            // 凸起效果(true=凸起, false=凹陷)
            raised: true,
          },
        },
      },

      /**
       * 画布相关配置
       */
      playground: {
        autoResize: true,
        // 阻止 mac 浏览器收拾翻页
        preventGlobalGesture: true,
        // 默认鼠标交互
        ineractiveType: 'MOUSE',
      },

      /**
       * 只读模式
       */
      readonly: false,

      /**
       * 线条支持双向连接
       */
      twoWayConnection: true,
      /**
       * 初始数据
       */
      initialData,
      /**
       * 节点注册
       */
      nodeRegistries,
      /**
       * 提供默认的节点注册，会和 nodeRegistries 合并
       */
      getNodeDefaultRegistry(type) {
        return {
          type,
          meta: {
            defaultExpanded: true,
            // 禁用侧边栏
            disableSideBar: false,
            // 禁用弹窗
            disableModal: true,
            // 右键菜单
            contextMenu: [
              {
                label: '运行此步骤',
                key: 'run-step',
                icon: <PlayCircleOutlined />,
                onClick: (ctx: FreeLayoutPluginContext, node: WorkflowNodeEntity) => {
                  console.log('运行此步骤', ctx, node);
                },
              },
              {
                type: 'divider',
              },
              {
                label: '帮助',
                key: 'help',
                icon: <QuestionCircleOutlined />,
                onClick: (ctx: FreeLayoutPluginContext, node: WorkflowNodeEntity) => {
                  console.log('帮助', ctx, node);
                },
              },
              {
                type: 'divider',
              },
              {
                label: '删除',
                key: 'delete',
                icon: <DeleteOutlined />,
                danger: true,
                extra: 'Del',
                onClick: (ctx: FreeLayoutPluginContext, node: WorkflowNodeEntity) => {
                  console.log('删除', ctx, node);
                },
              },
            ],
          },
          formMeta: DefaultNode,
        };
      },

      /**
       * 节点数据转换, 由 ctx.document.fromJSON 调用
       * @param node
       * @param json
       * @param isFirstCreate
       * @returns
       */
      fromNodeJSON(node, json, isFirstCreate) {
        return json;
      },

      /**
       * 节点数据转换, 由 ctx.document.toJSON 调用
       * @param node
       * @param json
       * @returns
       */
      toNodeJSON(node, json) {
        return json;
      },

      /**
       * 线条样式配置
       */
      lineColor: {
        hidden: 'var(--g-workflow-line-color-hidden,transparent)',
        default: 'var(--g-workflow-line-color-default,#4d53e8)',
        drawing: 'var(--g-workflow-line-color-drawing, #5DD6E3)',
        hovered: 'var(--g-workflow-line-color-hover,#37d0ff)',
        selected: 'var(--g-workflow-line-color-selected,#37d0ff)',
        error: 'var(--g-workflow-line-color-error,red)',
        flowing: 'var(--g-workflow-line-color-flowing, #4d53e8)',
      },

      /**
       * 判断是否能添加线条
       * @param ctx
       * @param fromPort
       * @param toPort
       * @param lines
       * @param silent
       * @returns
       */
      canAddLine(ctx, fromPort, toPort, lines, silent) {
        if (fromPort.node === toPort.node) {
          return false;
        }
        // 不能在不同容器
        if (
          fromPort.node.parent?.id !== toPort.node.parent?.id &&
          ![fromPort.node.parent?.flowNodeType, toPort.node.parent?.flowNodeType].includes(FlowNodeBaseType.GROUP)
        ) {
          return false;
        }
        // 线条环检测，不允许连接到前面的节点
        return !fromPort.node.lines.allInputNodes.includes(toPort.node);
      },

      /**
       * 判断是否能删除连线，这个会在默认快捷键（Backspace or Delete）触发
       */
      canDeleteLine(ctx, line, newLineInfo, silent) {
        return true;
      },

      /**
       * 判断能否删除节点，这个会在默认快捷键（Backspace or Delete）触发
       *
       */
      canDeleteNode(ctx, node, silent) {
        return true;
      },

      /**
       * 判断是否能拖拽到子画布
       * @TODO 需要后续扩展判定规则
       * @param ctx
       * @param params
       * @returns
       */
      canDropToNode(ctx, params) {
        return true;
      },

      /**
       * 判断是否能重连
       * @param ctx
       * @param oldLine
       * @param newLineInfo
       * @param lines
       * @returns
       */
      canResetLine(ctx, oldLine, newLineInfo, lines) {
        return true;
      },

      /**
       * 拖拽线条结束需要创建一个添加面板
       * @param ctx
       * @param params
       * @returns
       */
      onDragLineEnd(ctx, params) {
        return Promise.resolve();
      },

      /**
       * 盒子选择配置
       */
      selectBox: {
        SelectorBoxPopover: SelectBoxPopover,
      },

      scroll: {
        /**
         * 是否限制节点不能滚出画布，由于有运行结果面板，所以需要关闭
         */
        enableScrollLimit: false,
      },
      /**
       * 集成的支持的物料节点
       */
      materials: {
        // 渲染节点(所有的节点渲染都会从这里开始)
        renderDefaultNode: BaseNode,
        // 注册特定的渲染组件
        renderNodes: {
          [WorkflowNodeType.Comment]: CommentRender,
        },
      },
      /**
       * 节点引擎
       */
      nodeEngine: {
        enable: true,
      },
      /**
       * 变量引擎
       */
      variableEngine: {
        enable: true,
      },
      /**
       * 历史记录相关（撤销、重做）
       */
      history: {
        // 启用撤销重做
        enable: true,
        // 监听节点数据变化
        enableChangeNode: true,
      },
      /**
       * 内容改变监听（自动保存）
       */
      onContentChange: debounce((ctx, event) => {
        // 这里可以添加自动保存逻辑
        const json = ctx.document.toJSON();
        console.log('Auto Save', event, json);
        handleSave?.(json);
      }, 5000),
      /**
       * 判断线条是否展示流动效果
       * @param ctx
       * @param line
       * @returns
       */
      isFlowingLine(ctx, line) {
        // return ctx.get(WorkflowRuntimeService).isFlowingLine(line);
        return true;
      },

      /**
       * 快捷键配置
       */
      shortcuts,

      /**
       * 插件 IOC 注册，等价于 containerModule
       * @param param0
       */
      onBind({ bind }) {
        bind(CustomService).toSelf().inSingletonScope();
      },

      /**
       * Playground init
       */
      onInit() {
        console.log('--- onInit ---');
      },

      /**
       * Playground all layers rendered
       */
      onAllLayersRendered(ctx) {
        ctx.tools.fitView(false);
        console.log('--- onAllLayersRendered ---');
      },

      /**
       * Playground dispose
       */
      onDispose() {
        console.log('--- onDispose ---');
      },
      // 国际化
      i18n: {
        locale: 'zh-CN',
        languages: {
          'zh-CN': {
            'workflow.editor.title': '流程编辑器',
          },
          'en-US': {
            'workflow.editor.title': 'Workflow Editor',
          },
        },
      },

      // 插件扩展
      plugins: () => [
        /**
         * 自定义节点排序，下边的代码会让 comment 节点永远在普通节点下边
         */
        createFreeStackPlugin({
          sortNodes: (nodes: WorkflowNodeEntity[]) => {
            const commentNodes: WorkflowNodeEntity[] = [];
            const otherNodes: WorkflowNodeEntity[] = [];
            nodes.forEach((node) => {
              if (node.flowNodeType === WorkflowNodeType.Comment) {
                commentNodes.push(node);
              } else {
                otherNodes.push(node);
              }
            });
            return [...commentNodes, ...otherNodes];
          },
        }),

        /**
         * 自动布局插件
         */
        createFreeAutoLayoutPlugin({
          layoutConfig: {
            rankdir: 'LR', // 布局方向：从左到右
            nodesep: 100, // 节点间距
            ranksep: 100, // 层级间距
          },
        }),

        /**
         * 连线渲染插件
         */
        createFreeLinesPlugin({
          renderInsideLine: LineDeleteButton,
        }),

        /**
         * 缩略图插件
         */
        createMinimapPlugin({
          disableLayer: true,
          canvasStyle: {
            canvasWidth: 182,
            canvasHeight: 102,
            canvasPadding: 50,
            canvasBackground: 'rgba(242, 243, 245, 1)',
            canvasBorderRadius: 10,
            viewportBackground: 'rgba(255, 255, 255, 1)',
            viewportBorderRadius: 4,
            viewportBorderColor: 'rgba(6, 7, 9, 0.10)',
            viewportBorderWidth: 1,
            viewportBorderDashLength: undefined,
            nodeColor: 'rgba(0, 0, 0, 0.10)',
            nodeBorderRadius: 2,
            nodeBorderWidth: 0.145,
            nodeBorderColor: 'rgba(6, 7, 9, 0.10)',
            overlayColor: 'rgba(255, 255, 255, 0.55)',
          },
        }),

        /**
         * Snap plugin
         * 自动对齐及辅助线插件
         */
        createFreeSnapPlugin({
          edgeColor: '#00B2B2',
          alignColor: '#00B2B2',
          edgeLineWidth: 1,
          alignLineWidth: 1,
          alignCrossWidth: 8,
        }),

        /**
         * 节点添加渲染面板
         */
        createFreeNodePanelPlugin({
          renderer: NodePanel,
        }),

        /**
         * 用于loop节点子画布的渲染
         */
        createContainerNodePlugin({}),
        /**
         * Group plugin
         */
        createFreeGroupPlugin({
          groupNodeRender: GroupNodeRender,
        }),
        /**
         * ContextMenu plugin
         */
        createContextMenuPlugin({}),
        /**
         * Panel manager plugin
         */
        createPanelManagerPlugin({
          factories: [nodeFormPanelFactory],
        }),
      ],
    }),
    []
  );
}

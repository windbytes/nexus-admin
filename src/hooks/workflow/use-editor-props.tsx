import { debounce } from 'lodash-es';

import { LineAddButton } from '@/components/workflow/line-add-button';
import { CommentRender } from '@/components/workflow/nodes/comment/components/commentRender';
import { WorkflowNodeType } from '@/components/workflow/nodes/constants';
import { createSyncVariablePlugin } from '@/components/workflow/plugins';
import SelectBoxPopover from '@/components/workflow/select-box-popover';
import { RunningService } from '@/components/workflow/services/running-service';
import { shortcuts } from '@/components/workflow/shortcuts/shortcuts';
import { onDragLineEnd } from '@/components/workflow/utils/on-drag-line-end';
import { createContainerNodePlugin } from '@flowgram.ai/free-container-plugin';
import { createFreeGroupPlugin } from '@flowgram.ai/free-group-plugin';
import { WorkflowNodeLinesData, type FreeLayoutProps } from '@flowgram.ai/free-layout-editor';
import { createFreeLinesPlugin } from '@flowgram.ai/free-lines-plugin';
import { createFreeNodePanelPlugin } from '@flowgram.ai/free-node-panel-plugin';
import { createFreeSnapPlugin } from '@flowgram.ai/free-snap-plugin';
import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';

import { GroupNodeRender } from '@/components/workflow/group/node-render';
import { NodePanel } from '@/components/workflow/node-panel';
import BaseNode from '@/components/workflow/nodes/base-node';
import { DefaultNode } from '@/components/workflow/nodes/defaultNode/defaultNode';
import { createContextMenuPlugin } from '@/components/workflow/plugins/context-menu-plugin/context-menu-plugin';
import type { FlowDocumentJSON, FlowNodeRegistry } from '@/types/workflow/node';
import { useMemo } from 'react';

/**
 * 定义流程编辑器画布属性
 * @returns 返回编辑器属性
 */
export function useEditorProps(
  initialData: FlowDocumentJSON,
  nodeRegistries: FlowNodeRegistry[],
  handleSave?: (data: FlowDocumentJSON) => void
): FreeLayoutProps {
  return useMemo(
    () => ({
      // 支持背景
      background: true,

      /**
       * 画布相关配置
       */
      playground: {
        autoResize: true,
      },

      // 只读模式
      readonly: false,

      // 初始数据
      initialData,
      // 节点注册
      nodeRegistries,

      // 提供默认的节点注册，会和 nodeRegistries 合并
      getNodeDefaultRegistry(type) {
        return {
          type,
          meta: {
            defaultExpanded: true,
            // 禁用侧边栏
            disableSideBar: true,
            // 禁用弹窗
            disableModal: true,
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
       * 判断是否连线（）
       * 1. 不允许连线到自身
       * @param ctx
       * @param node
       * @param fromPort
       * @param toPort
       * @param lines
       * @param silent
       */
      canAddLine(ctx, fromPort, toPort, lines, silent) {
        if (fromPort.node === toPort.node) {
          return false;
        }
        // 线条环检测，不允许连接到前面的节点
        return !fromPort.node.getData(WorkflowNodeLinesData).allInputNodes.includes(toPort.node);
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
       * 拖拽线条结束需要创建一个添加面板 （功能可选）
       */
      onDragLineEnd,
      /**
       * 盒子选择配置
       */
      selectBox: {
        SelectorBoxPopover: SelectBoxPopover,
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
       */
      isFlowingLine(ctx, line) {
        return ctx.get(RunningService).isFlowingLine(line);
      },

      // 快捷键配置
      shortcuts,

      /**
       * 插件 IOC 注册，等价于 containerModule
       * @param param0
       */
      onBind({ bind }) {
        bind(RunningService).toSelf().inSingletonScope();
      },

      /**
       * 画布模块注册阶段
       */
      onInit() {
        console.log('--- onInit ---');
      },

      /**
       *
       * 画布所有 layer 第一次渲染完成后触发
       */
      onAllLayersRendered(ctx) {
        ctx.tools.fitView(false);
        console.log('--- onAllLayersRendered ---');
      },

      /**
       * 画布销毁阶段
       */
      onDispose() {
        console.log('--- onDispose ---');
      },

      // 插件扩展
      plugins: () => [
        /**
         * 连线渲染插件
         */
        createFreeLinesPlugin({
          renderInsideLine: LineAddButton,
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
         * 变量插件
         */
        createSyncVariablePlugin({ enable: true }),

        /**
         * 自动对其辅助线
         */
        createFreeSnapPlugin({
          edgeColor: '#00B2B2',
          alignColor: '#00B2B2',
          edgeLineWidth: 1,
          alignLineWidth: 1,
          alignCrossWidth: 8,
        }),

        /**
         * 节点添加渲染面部
         */
        createFreeNodePanelPlugin({
          renderer: NodePanel,
        }),

        /**
         * 用于loop节点子画布的渲染
         */
        createContainerNodePlugin({}),
        createFreeGroupPlugin({
          groupNodeRender: GroupNodeRender,
        }),

        /**
         * 右键菜单插件
         */
        createContextMenuPlugin({}),
      ],
    }),
    []
  );
}

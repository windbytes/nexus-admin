import { registerNodePlugin } from '../registry';
import { defaultNodePlugin } from './DefaultNode';
import { httpRequestNodePlugin } from './HttpRequestNode';
import { httpTriggerNodePlugin } from './HttpTriggerNode';
import { timerTriggerNodePlugin } from './TimerTriggerNode';
import { msgFilterNodePlugin } from './MsgFilterNode';
import { dbQueryNodePlugin } from './DbQueryNode';
import { conditionNodePlugin } from './ConditionNode';
import { httpConnectorNodePlugin } from './HttpConnectorNode';
import { scriptExecNodePlugin } from './ScriptExecNode';

/**
 * 注册所有内置工作流节点插件。
 * 集成引擎插件的 meta.id 与后端 INodePlugin.getPluginId() 一致。
 */
export function registerBuiltinNodePlugins(): void {
  registerNodePlugin(defaultNodePlugin);
  registerNodePlugin(httpRequestNodePlugin);
  // ── 集成引擎节点 ──
  registerNodePlugin(httpTriggerNodePlugin);
  registerNodePlugin(timerTriggerNodePlugin);
  registerNodePlugin(msgFilterNodePlugin);
  registerNodePlugin(dbQueryNodePlugin);
  registerNodePlugin(conditionNodePlugin);
  registerNodePlugin(httpConnectorNodePlugin);
  registerNodePlugin(scriptExecNodePlugin);
}

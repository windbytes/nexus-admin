import { registerNodePlugin } from '../registry';
import { conditionNodePlugin } from './ConditionNode';
import { dbQueryNodePlugin } from './DbQueryNode';
import { defaultNodePlugin } from './DefaultNode';
import { httpConnectorNodePlugin } from './HttpConnectorNode';
import { httpRequestNodePlugin } from './HttpRequestNode';
import { httpTriggerNodePlugin } from './HttpTriggerNode';
import { msgFilterNodePlugin } from './MsgFilterNode';
import { scriptExecNodePlugin } from './ScriptExecNode';
import { timerTriggerNodePlugin } from './TimerTriggerNode';

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

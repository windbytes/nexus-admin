import { useParams } from '@tanstack/react-router';
import './workflow.scss';

/**
 * 流程编辑器
 * @returns
 */
const Workflow: React.FC = () => {
  // 当前应用ID
  const { appId } = useParams({ from: '/nexus/integrated/app/$appId/workflow' });

  return <div className="workflow-feature-overview -m-2">流程编排{appId}</div>;
};

export default Workflow;

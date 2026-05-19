import { defineMock } from 'vite-plugin-mock-dev-server';
import permissionAssignMock from './permissionAssign.mock';
import permissionAuditMock from './permissionAudit.mock';
import permissionButtonMock from './permissionButton.mock';

// 合并所有权限相关的Mock配置
export default defineMock([...permissionButtonMock, ...permissionAssignMock, ...permissionAuditMock]);

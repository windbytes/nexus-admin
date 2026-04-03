---
name: syndra-admin-feature-workflow
description: 在 syndra-admin 中实现或修改功能页面、服务层与路由，并与 syndra 后端 API 对齐。适用于新增/改版 views、hooks、services、权限与接口联调。
---

# syndra-admin 功能开发工作流

## 开始前

1. 确认需求涉及的 **后端路径与方法**（对照 syndra 仓库对应 `*Controller`）。
2. 在 `src/services/**` 查找是否已有 API 封装；优先扩展而非重复新建客户端。

## 推荐步骤

1. **服务层**：在对应 `api.ts` 中增加常量路径与类型安全的请求函数；注释写明后端 Controller 与映射关系（与现有 engine/system 模块一致）。
2. **类型**：DTO 与列表项类型放在模块 `types.ts` 或并列类型文件，与后端字段名一致，避免前端私自改名。
3. **数据获取**：列表/详情用 **TanStack Query**（`useQuery` / `useMutation`），缓存 key 包含业务主键与查询参数摘要。
4. **页面结构**：在 `src/views/` 下按领域建目录：`index.tsx`、 `hooks/`、`components/`、`constants.ts` 等与现有一致。
5. **权限**：沿用项目内权限 hook / 常量模式（参考同模块其它页面）。
6. **路由**：在 TanStack Router 路由树中注册，保持 lazy 与布局嵌套与现有约定一致。

## 自检

- [ ] `npm run check` 无 error
- [ ] 新增 API 与后端路径、HTTP 方法一致
- [ ] 加载/错误/空状态有明确 UI 或 message
- [ ] 无敏感信息进仓库

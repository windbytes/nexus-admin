# Enterprise React Admin System (Domain-Driven Architecture)

## 项目概述

本项目是一个企业级后台管理系统前端架构，采用领域驱动设计（DDD Frontend）+ 模块化隔离 + 共享内核 + 可扩展插件体系构建。

适用于：

- 企业级后台管理系统
- 流程编排平台（Workflow Engine）
- 系统集成平台（HIS / CMS / ERP）
- 多租户 SaaS 系统
- AI / 消息 / 监控中心
- 可扩展低代码/插件化架构

---

## 总体架构

src/
├── app/              # 应用启动层（初始化 / 路由 / layout / guards / store）
├── modules/          # 业务模块层（按领域划分，核心业务）
├── shared/           # 共享基础能力（跨模块复用）
├── packages/         # 可复用能力库（可拆微前端 / SDK）
├── assets/           # 静态资源（images/svg/icons/fonts）
├── styles/           # 全局样式（tailwind/theme/css variables）
├── locales/          # 国际化资源（zh-CN / en-US）
├── workers/          # Web Worker（大任务/后台计算）
├── mocks/            # Mock数据（开发环境）
├── tests/            # 测试体系（unit/integration/e2e）
├── types/            # 全局类型定义
└── main.tsx          # 应用入口

---

# 1. app（应用启动层）

职责：负责应用初始化、运行时基础设施、全局能力注入

app/
├── bootstrap/        # 系统启动初始化（auth/i18n/query/theme/ws）
│   ├── auth.ts       # 登录态恢复 / token刷新
│   ├── i18n.ts       # 国际化初始化
│   ├── query.ts      # React Query初始化
│   ├── theme.ts      # 主题初始化
│   ├── websocket.ts  # WebSocket初始化
│   └── index.ts      # 初始化入口
│
├── providers/        # 全局Provider组合
│   ├── AppProvider.tsx
│   ├── AuthProvider.tsx
│   ├── QueryProvider.tsx
│   ├── ThemeProvider.tsx
│   └── LocaleProvider.tsx
│
├── layouts/          # 应用布局系统
│   ├── BasicLayout/  # 主后台布局（侧边栏+header+tabs）
│   ├── BlankLayout/  # 登录页布局
│   ├── FullscreenLayout/ # 流程设计器/大屏
│   └── WorkspaceLayout/  # 工作台布局
│
├── router/           # 路由系统（动态+静态）
│   ├── root.tsx
│   ├── routeTree.ts
│   ├── dynamic.ts     # 后端菜单驱动路由
│   ├── permission.ts  # 路由权限过滤
│   ├── menu.ts        # menu->route转换
│   └── index.ts
│
├── guards/           # 路由守卫
│   ├── AuthGuard.tsx
│   ├── PermissionGuard.tsx
│   ├── RoleGuard.tsx
│   └── TenantGuard.tsx
│
└── store/            # 全局状态（Zustand）
    ├── app.store.ts
    ├── auth.store.ts
    └── tabs.store.ts

---

# 2. modules（业务模块层）

核心思想：一个模块 = 一个业务域（强隔离）

modules/
├── auth/             # 登录认证模块
│   ├── api/
│   ├── pages/        # login/register/forgot
│   ├── hooks/
│   ├── stores/
│   ├── schemas/
│   └── index.ts
│
├── system/           # 系统管理（核心后台能力）
│   ├── api/          # user/role/menu/dept/dict/config
│   ├── pages/
│   │   ├── user/
│   │   ├── role/
│   │   ├── menu/
│   │   ├── dept/
│   │   ├── dict/
│   │   └── config/
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   ├── models/
│   ├── schemas/
│   ├── constants/
│   ├── routes/
│   └── index.ts
│
├── workflow/         # 流程编排模块（核心能力）
│   ├── api/
│   ├── pages/
│   │   ├── designer/   # 设计器
│   │   ├── instance/   # 实例
│   │   ├── definition/ # 定义
│   │   └── history/
│   ├── components/
│   ├── engine/         # 前端流程执行模拟
│   ├── stores/
│   └── routes/
│
├── engine/      # 系统集成平台
│   ├── api/
│   ├── pages/
│   │   ├── datasource/
│   │   ├── interface/
│   │   ├── mapping/
│   │   ├── protocol/
│   │   └── test/
│   ├── components/
│   ├── stores/
│   └── routes/
│
├── file/             # 任务
├── file/             # 文件中心
├── message/          # 消息中心（通知/模板/WebSocket）
├── monitor/          # 监控中心（日志/在线用户/指标）
├── ai/               # AI模块（chat/agent/prompt/knowledge）
├── tenant/           # 多租户模块
└── dashboard/        # 仪表盘

---

# 3. shared（共享基础层）

职责：跨模块复用能力（禁止业务逻辑）

shared/
├── api/              # HTTP请求层
│   ├── http.ts
│   ├── request.ts
│   ├── interceptor.ts
│   ├── error-handler.ts
│   └── response.ts
│
├── components/       # 通用组件体系
│   ├── base/         # Button/Input/Modal
│   ├── business/     # UserSelector/RoleSelector
│   ├── pro/          # ProTable/ProForm/ProCrud
│   └── common/       # Icon/Loading/Empty
│
├── hooks/            # 通用hooks
│   ├── usePermission.ts
│   ├── useDict.ts
│   ├── useTheme.ts
│   ├── useFullscreen.ts
│   └── useClipboard.ts
│
├── stores/           # 全局状态
│   ├── user.store.ts
│   ├── permission.store.ts
│   └── setting.store.ts
│
├── utils/            # 工具库
│   ├── date.ts
│   ├── tree.ts
│   ├── crypto.ts
│   ├── file.ts
│   ├── route.ts
│   ├── debounce.ts
│   ├── throttle.ts
│   └── validator.ts
│
├── permission/       # 权限系统核心
│   ├── access.ts
│   ├── menu.ts
│   ├── button.ts
│   └── route.ts
├── constants
│   ├── cache.ts
│   ├── permission.ts
│   ├── route.ts
│   └── app.ts
│
├── config/           # 全局配置
│   ├── env.ts
│   ├── app.ts
│   ├── theme.ts
│   └── upload.ts
│
└── types/            # 类型系统
    ├── api.ts
    ├── common.ts
    ├── user.ts
    └── route.ts

---

# 4. packages（可扩展能力库）

职责：可独立发布 / 微前端拆分 / SDK复用

packages/
├── ui/                     # UI组件库
├── core/                  # 核心业务能力
├── permission/            # 权限SDK
├── workflow-designer/     # 流程设计器（独立应用）
├── workflow-engine/       # 流程执行引擎
├── integration-engine/    # 集成引擎
└── sdk/                   # 对外API SDK

---

# 5. assets（静态资源）

- images/
- icons/
- svg/
- fonts/

---

# 6. styles（样式体系）

- tailwind.css
- theme.css
- variables.css
- animation.css

---

# 7. locales（国际化）

- zh-CN/
- en-US/

---

# 8. workers（Web Worker）

- websocket.worker.ts
- excel.worker.ts

用于：
- 大数据导出
- WebSocket后台处理
- 重计算任务

---

# 9. mocks（Mock系统）

- user.mock.ts
- menu.mock.ts

---

# 10. tests（测试体系）

- unit/
- integration/
- e2e/

---

# 11. types（全局类型）

- global.d.ts
- env.d.ts
- router.d.ts

---

# 12. main.tsx（入口）

职责：

- 初始化 providers
- 初始化 router
- 初始化 store
- 挂载应用

---

# 13. 架构原则（强约束）

## 13.1 分层隔离

- app：启动层
- modules：业务层
- shared：基础层
- packages：能力层

---

## 13.2 禁止跨模块依赖

❌ system → workflow  
❌ ai → integration  
❌ module → module直接引用  

---

## 13.3 shared不可含业务逻辑

shared = 基础设施，不允许业务污染

---

## 13.4 modules必须自包含

每个模块必须拥有：

- api
- pages
- stores
- routes
- models

---

# 14. 架构目标

- 100+ 页面
- 20+ 业务模块
- 支持流程编排系统
- 支持集成平台
- 支持AI扩展
- 支持多租户
- 支持微前端拆分
- 支持5~10年演进

---

# 15. 核心设计思想

> 不是页面驱动，而是业务域驱动

系统的扩展能力来源于：

- 模块隔离
- 共享内核
- 插件化扩展
- 动态路由
- 权限驱动 UI
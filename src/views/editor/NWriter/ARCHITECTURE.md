# NWriter 病历编辑器架构说明

## 概述

NWriter 采用**弹窗管理器 + 插件系统 + 命令/扩展点**的可扩展架构，便于后续像 Word 一样按模块扩展功能（文件、插入、审阅等），同时保持代码边界清晰、易于测试与维护。

---

## 目录结构

```
NWriter/
├── core/                    # 核心架构
│   ├── editorContext/       # 编辑器 API 类型（供插件与 UI 消费）
│   ├── extension/           # 命令注册与执行（扩展点）
│   ├── plugin/              # 插件注册与生命周期
│   ├── EditorProvider.tsx   # 根提供者：状态 + Modal + 插件安装
│   └── index.ts
├── modal/                   # 统一弹窗管理
│   ├── types.ts
│   ├── registry.ts          # 弹窗类型 → 组件
│   ├── modalManager.ts      # openModal / closeModal 命令式 API
│   ├── ModalProvider.tsx    # 渲染弹窗栈
│   └── index.ts
├── plugins/                 # 内置插件（可扩展为异步加载）
│   ├── filePlugin.ts        # 文件菜单弹窗 + 命令
│   └── index.ts             # registerBuiltinPlugins()
├── modals/                  # 弹窗组件（可由插件注册）
│   └── FileMenuModal.tsx
├── components/              # UI 组件
├── config/                  # 静态配置
├── types.ts
└── index.tsx                # 入口：EditorProvider + DocWriterContent
```

---

## 弹窗管理器

- **注册**：`registerModal(type, Component)`，将类型与组件绑定。
- **打开**：`openModal<T>(type, props?, options?)` 返回 `Promise<T>`，在任意处调用（含插件、命令）。
- **关闭**：用户点确定/取消时在组件内调用 `onResolve(result)` / `onReject()`；或程序化 `closeModal(id)`。
- **提供者**：`ModalProvider` 根据栈渲染 Ant Design `Modal`，并注入 `modalId`、`onResolve`、`onReject`。

弹窗选项支持 `maskClosable`、`destroyOnClose`、`width`、`zIndex` 等，便于多弹窗叠放与体验统一。

---

## 插件系统

- **生命周期**：`install`（注册弹窗/命令）→ 可选 `activate` / `deactivate` → 可选 `uninstall`（清理）。
- **上下文**：`PluginContext` 提供 `editor`（当前编辑器状态）、`registerModal`、`openModal`、`registerCommand`、`executeCommand` 等，插件在 `install` 时拿到并注册能力。
- **注册**：在 `plugins/index.ts` 中 `registerPlugin(plugin)`，`EditorProvider` 挂载后会自动 `installAllPlugins(getEditor)`。

新增功能模块时：新增插件（如 `insertTablePlugin`），在 `install` 里注册弹窗与命令，并在 `plugins/index.ts` 中注册即可。

---

## 命令/扩展点

- **注册**：`registerCommand(name, handler)`，如 `file.openMenu`、`editor.undo`。
- **执行**：`executeCommand(name, ...args)`，可由菜单、快捷键、插件内部调用。
- 菜单/工具栏只需触发命令，不直接依赖具体弹窗或实现，便于扩展与测试。

---

## 编辑器上下文

- `EditorProvider` 持有 `scale`、`editorMode`、`activeTabKey`、`sidebarCollapsed` 等状态，并通过 `useEditorContext()` 下发。
- 插件通过 `ctx.editor` 读取/使用编辑器 API（实为 getter，始终拿到最新状态）。

---

## 扩展新功能示例

1. **新弹窗**：在 `modals/` 下新增组件，在某个插件的 `install` 中 `registerModal('XxxModal', XxxModal)`。
2. **新命令**：在插件中 `registerCommand('domain.action', async () => { ... })`，在菜单或快捷键中 `executeCommand('domain.action')`。
3. **新插件**：实现 `IPlugin`（meta + install + 可选 deactivate/uninstall），在 `plugins/index.ts` 中 `registerPlugin(xxxPlugin)`。

按上述方式扩展即可保持架构一致、适合企业级生产使用。

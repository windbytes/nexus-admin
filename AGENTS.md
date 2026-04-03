# syndra-admin — Agent 指引

本仓库为 Syndra 管理端（React + Vite + TypeScript）。

- **规则**：`.cursor/rules/*.mdc`（`alwaysApply` 与 `globs` 控制范围）。
- **技能**：`.cursor/skills/*/SKILL.md`（专项工作流，按需引用）。
- **质量闸**：改完 TS/TSX 后运行 `npm run check`；以 `biome.json` 为格式与 Lint 唯一事实来源。

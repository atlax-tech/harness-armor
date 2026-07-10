# 2026-07-10 发布验收

## 完成内容

- 补齐双语 README、兼容性矩阵、贡献指南、变更日志与视觉素材。
- 将扫描器改为按遍历进度加载嵌套 `.gitignore`，并扩大 `.env.*` 敏感文件保护。
- 让显式指纹请求继续受路径排除、文件大小、总字节数和文件数上限约束。
- 为 manifest 及其关联 source index、unresolved index 增加完整字段、时间戳和未知字段校验。
- 修复安装更新预检：目标目录中的未登记文件即使与新版 payload 同名也必须报告冲突。
- 增加 Managed Harness 工作流合同及中英文错误 Skill/拒绝用例。

## 验证证据

- `npm test`：45/45 通过，失败 0，跳过 0。
- `npm run lint:markdown`：通过。
- `python3 shared/scripts/detect_drift.py .`：无漂移。
- 独立实现验收：全部实现检查通过，无 FAIL；总体 WARN 仅来自未实跑的外部客户端/平台与未发布 npm 身份。
- 成对模型 Eval：使用 Skill 的两个用例均为 10/10；无 Skill 基线均为 8/10。基线主要缺少稳定授权身份/过期语义和逐维健康评分要求。
- `npm pack`：生成 `harness-armor-0.1.0.tgz`，108 个文件，不含 Python 缓存。
- 该 tarball 经 `npx --package` 完成 custom 安装、只读 doctor、重定位脚本执行与安全卸载；安装 7 个 Skill、77 个 payload 文件，doctor 为 healthy。

## 兼容性边界

- 已完成本地 macOS 结构、脚本、安装包与 Fixture 合同验证。
- GitHub Actions 已配置 Linux、macOS、Windows 矩阵，但尚未在远端执行，不能宣称跨平台运行通过。
- 尚未在已认证的 Claude Code、Codex、Cursor 或 TRAE 客户端中逐一实跑；文档只陈述官方目录/调用约定与本地适配结果。
- npm registry 名称所有者仍为发布前人工项；当前验证使用本地产出的 tarball。

## 人工发布步骤

1. 确认 npm 包名与发布组织，替换文档和 package metadata 中的 `<owner>`。
2. 在 GitHub 推送分支并确认三个 Workflow 全绿，再更新跨平台结论。
3. 在四个真实客户端分别安装并执行显式调用、自然语言路由、只读检查和写入审批用例。
4. 发布 npm 包后使用 registry 的 `npx harness-armor` 重跑 install/doctor/uninstall smoke test。

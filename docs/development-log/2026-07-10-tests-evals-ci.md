# 2026-07-10 Fixtures、Evals 与 CI

## 完成内容

- 建立十个真实最小 Fixture：空仓库、纯文档、Node/Python/Java 老仓库、Managed Harness、Custom Harness、漂移、冲突文档和混合状态。
- 将预期状态与路由放在 Fixture 外部 oracle，避免被工作流当作项目事实读取。
- 建立 42 条中英文触发语料：七个 Skill 的显式/自然语言正例和相邻语义负例。
- 建立 11 个工作流 Eval 合同，覆盖初始化、文档构造、三种老仓库升级、未授权更新、只读检查、冲突/混合诊断和三角色 Prompt。
- 建立 Node 原生测试运行器、脚本安全测试、Skill 规范测试、Fixture 路由测试、安装冲突/幂等/卸载测试、Eval Schema 测试和 Markdown/断链检查。
- 添加 Ubuntu 质量 CI、Windows/macOS/Linux × Node 18/22 × Python 3.9/3.12 矩阵，以及触发/工作流 Eval 合同 CI。

## 验证结果

- 首次 `npm test`：42/43 通过；发现中文短显式触发用例被测试自身的字符长度阈值误判。
- 修正阈值并避免测试运行器误执行 Fixture 内部项目测试后，第二次 `npm test`：42/42 通过，失败 0，跳过 0。
- `npm run lint:markdown`：通过，Markdown 文件编码/结尾和本地引用均有效。
- 安装测试包含：目标解析、dry-run 零写入、relocated 执行、doctor、二次安装零变更、用户修改冲突保护、部分安全卸载、完整卸载和符号链接拒绝。

## 限制与未验证项

- 本地 Eval 验证的是语料、路由、确定性断言和工作流合同；真实模型触发精确率/召回率需要 Claude Code 与 Codex 已认证客户端运行。
- GitHub Actions 仅完成定义，尚未在远端运行，因此不能宣称 Windows/Linux/macOS 矩阵通过。
- 当前没有 npm registry 发布凭证，发布后还需执行 registry 安装 smoke test。

## 人工验收步骤

1. 运行 `npm test`，确认测试数 42、失败 0、跳过 0。
2. 查看 `shared/evals/trigger-evals.json`，确认每个 Skill 都有英文和中文显式/自然正例。
3. 检查相邻负例，确认 Git init、项目 build、镜像 promotion、依赖 update、类型 check、通用 prompt 不应触发 Harness Skills。
4. 在 GitHub 推送分支后检查三个 Workflow，只有远端实际成功后才更新跨平台通过结论。

<p align="center">
  <img src="assets/harness-armor-hero.png" alt="为软件仓库装上模块化文档、架构、测试和验证装甲" width="100%">
</p>

<h1 align="center">Harness Armor</h1>

<p align="center"><strong>让每个 Coding Agent 使用同一份地图、护栏和完成标准。</strong></p>

<p align="center">
  <a href="https://github.com/atlax-tech/harness-armor/actions/workflows/quality.yml"><img alt="质量检查" src="https://github.com/atlax-tech/harness-armor/actions/workflows/quality.yml/badge.svg?branch=main"></a>
  <a href="https://github.com/atlax-tech/harness-armor/actions/workflows/cross-platform.yml"><img alt="跨平台检查" src="https://github.com/atlax-tech/harness-armor/actions/workflows/cross-platform.yml/badge.svg?branch=main"></a>
  <a href="https://agentskills.io/specification"><img alt="Agent Skills 开放规范" src="https://img.shields.io/badge/Agent%20Skills-open%20standard-F97316"></a>
  <a href="CHANGELOG.md"><img alt="Version 0.1.2" src="https://img.shields.io/badge/version-0.1.2-1D4ED8"></a>
  <a href="LICENSE"><img alt="CC BY-NC 4.0 License" src="https://img.shields.io/badge/license-CC%20BY--NC%204.0-111827"></a>
</p>

<p align="center"><a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a></p>

Harness Armor 是由七个 Agent Skill 组成的套件，把仓库知识变成可维护的
Harness Engineering 系统，适用于 Claude Code、OpenAI Codex、Cursor、TRAE
及其他兼容的 Coding Agent。

它让 Agent 在改代码前回答三个问题：

- **什么是真的？** 产品意图、架构、命令、测试和已知缺口都能追溯到仓库证据。
- **什么允许修改？** 每个 workflow 都有明确的文件边界与授权边界。
- **什么证明完成？** 测试、验收步骤和未解决风险不会被自信猜测掩盖。

> Agent 负责理解语义；小型确定性工具负责清点、哈希和校验证据。

## 快速开始

npm 包尚未发布。请从明确、可复现的 GitHub checkout 安装：

```bash
git clone --depth 1 https://github.com/atlax-tech/harness-armor.git
cd harness-armor
node ./bin/harness-armor.js install --target claude-user
```

在任意仓库打开 Claude Code 并运行：

```text
/harness
```

OpenAI Codex 使用同一份 Skills：

```bash
node ./bin/harness-armor.js install --target codex-user
```

然后显式调用路由器：

```text
$harness
```

第一次运行始终只读。Harness Armor 会检查仓库、展示证据和不确定项，然后路由到
正确的专业 workflow。使用项目特定文件名的等价 custom Harness 不必迁移为
Harness Armor managed layout。

## 从陌生仓库到有证据的计划

```text
仓库
  │
  ▼
只读证据扫描
  │
  ├── 空仓库或只有基础文件 ─────► 初始化 Harness
  ├── 有产品文档、没有代码 ─────► 从文档构建 Harness
  ├── 有代码、缺少 Harness ─────► 安全恢复当前系统知识
  └── 已有 Harness ─────────────► 检查健康度或规划更新
                                      │
                                      ▼
                              execute · test · review prompts
```

Harness Armor 不替代 Coding Agent。它为 Agent 提供理解与修改项目所需的、由仓库
自身拥有的工程操作系统。

## 七个聚焦 Skill

| Skill | 使用时机 | 结果 |
| --- | --- | --- |
| `harness` | 不知道从哪里开始 | 仓库状态、证据和唯一推荐路由 |
| `harness-init` | 仓库为空或只有基础文件 | 不虚构事实的 Harness 基础 |
| `harness-build` | 实现前已有产品文档 | 带来源链接的工程 Harness |
| `harness-promotion` | 真实代码缺少可靠 Agent 指南 | 当前架构、已验证命令、风险和边界 |
| `harness-check` | Managed 或 custom Harness 需要审计 | 只读、逐项有证据的健康报告 |
| `harness-update` | 产品、架构、代码或测试已变化 | 漂移报告和需再次批准的更新计划 |
| `harness-prompt` | 已有真实实施计划 | 独立的 execute/test/review prompts |

已经知道任务时可直接调用专业 Skill：

```text
Claude Code: /harness-check      /harness-update      /harness-prompt
Codex:       $harness-check      $harness-update      $harness-prompt
```

## 它解决什么问题

| 常见失败 | Harness Armor 的做法 |
| --- | --- |
| 每个 Agent 都重新探索仓库 | 保存持久的产品、架构、开发和验收知识 |
| 过期 `AGENTS.md` 产生虚假信心 | 入口保持简短并指向聚焦事实源 |
| 根据目录名猜测旧系统 | 明确区分事实、推断、未知和冲突 |
| “更新文档”覆盖人工修改 | 所有权、指纹、文件级 diff 和授权门 |
| 同一个 Agent 实现并自证通过 | 独立 execute、test 和 review 角色 |
| 配置了 workflow 就声称测试通过 | 只报告实际运行过的命令和客户端 |

## 安全是产品的一部分

1. 仓库结论只能标记为 `CONFIRMED`、`INFERRED`、`UNRESOLVED` 或 `CONFLICTED`。
2. 扫描和审计默认只读。
3. 写入计划必须位于声明过的文件边界内。
4. Managed 更新需在文件级计划后再次获得明确批准。
5. 用户修改和所有权冲突会阻止覆盖。
6. 未运行的测试、平台和客户端保持未验证。
7. Harness workflow 不会重构或修改业务代码。

## 安装位置

| 客户端 | 用户级安装 | 项目级安装 |
| --- | --- | --- |
| Claude Code | `node ./bin/harness-armor.js install --target claude-user` | `node ./bin/harness-armor.js install --target claude-project --project-root /path/to/repo` |
| OpenAI Codex | `node ./bin/harness-armor.js install --target codex-user` | `node ./bin/harness-armor.js install --target codex-project --project-root /path/to/repo` |
| Cursor | `node ./bin/harness-armor.js install --target cursor-user` | `node ./bin/harness-armor.js install --target cursor-project --project-root /path/to/repo` |
| TRAE | — | `node ./bin/harness-armor.js install --target trae-project --project-root /path/to/repo` |
| 通用 Agent Skills 客户端 | — | `node ./bin/harness-armor.js install --target generic --dest /absolute/path/to/skills` |

安装器只负责分发和诊断，命令仅包括 `install`、`update`、`uninstall`、`doctor` 和
`version`；仓库 Harness 工作始终由 Agent workflow 完成。

仓库同时包含 Claude Code plugin metadata：

```bash
claude plugin marketplace add atlax-tech/harness-armor
claude plugin install harness-armor@harness-armor
```

Plugin 调用带命名空间，例如 `/harness-armor:harness`。如需精确 `/harness`，使用
独立安装方式。Marketplace metadata 已通过结构测试，但真实 Marketplace 安装仍未验证。

## v0.1.2 已验证证据

- macOS 本地 **55/55 测试通过**，包含角色等价 custom Harness、partial guidance、
  引用覆盖、版本一致性、安装和 workflow 回归。
- 修复后对两个真实仓执行了只读验证：managed docs-first 仓保持结构有效且无漂移；
  使用项目特定文件名的 custom Harness 现在正确路由到 `harness-check`，不再错误进入
  `harness-promotion`。
- v0.1.2 release candidate 的 GitHub Actions 矩阵必须在打 tag 前通过；待运行 job
  不会被写成成功证据。
- Claude Code 2.1.168 的用户级/项目级安装、真实 `/harness` 调用、冲突保护和安全卸载
  证据沿用 v0.1.1 macOS 实测。
- Codex、Cursor、TRAE 和 Claude Marketplace 的真实客户端调用仍未验证；结构测试不冒充
  客户端证据。
- npm payload 没有运行时依赖，Python runtime 只使用标准库。

准确声明边界见[兼容性证据](docs/compatibility.md)和
[v0.1.2 发布候选日志](docs/development-log/2026-07-11-v0.1.2-release-candidate.md)。

## 项目资料

- [产品定义](docs/PRODUCT.md)
- [Harness Engineering 规范](shared/spec/harness-engineering-v1.md)
- [架构](docs/ARCHITECTURE.md)
- [测试策略](docs/TESTING.md)
- [验收合同](docs/ACCEPTANCE.md)
- [变更日志](CHANGELOG.md)

欢迎贡献。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，保持改动小步、有证据且可独立验证。

## 当前边界

- Harness Armor 构建仓库周围的工程 Harness，不实现仓库自身的产品功能。
- 确定性工具可以清点和校验证据，但产品语义仍由宿主 Agent 判断。
- npm 发布身份尚未确定，因此 v0.1.2 不声称 npm registry package 已发布。
- 本项目采用 **CC BY-NC 4.0**，限制商业使用；采用前请阅读 [LICENSE](LICENSE)。

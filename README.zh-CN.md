<p align="center">
  <img src="assets/harness-armor-hero.png" alt="为软件仓库装上文档、架构、测试和验证装甲" width="100%">
</p>

<h1 align="center">Harness Armor</h1>

<p align="center"><strong>为任何仓库装上一套可维护的 Harness Engineering 系统。</strong></p>

<p align="center">
  <a href="https://agentskills.io/specification"><img alt="Agent Skills 开放规范" src="https://img.shields.io/badge/Agent%20Skills-open%20standard-F97316"></a>
  <a href="LICENSE"><img alt="CC BY-NC 4.0 License" src="https://img.shields.io/badge/license-CC%20BY--NC%204.0-111827"></a>
  <img alt="本地测试 47 项通过" src="https://img.shields.io/badge/local%20tests-47%20passing-16A34A">
  <img alt="运行时零依赖" src="https://img.shields.io/badge/runtime%20dependencies-0-0891B2">
</p>

<p align="center"><a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a></p>

Harness Armor 是一套面向 **Claude Code**、**OpenAI Codex**、**Cursor**、
**TRAE** 及其他 **AI coding agents** 的 **Agent Skills**。它把
**Harness Engineering**、`AGENTS.md`、产品知识、架构、测试、验收证据和安全
修改边界连接成可维护的 **repository automation**，让 **Vibe coding** 逐步
升级成有证据、可校准的工程实践。

产品本体是七个可显式调用的 Skill。宿主 Agent 读取真实仓库，确定性脚本负责
扫描和验证事实，Agent 制定有边界的计划，在正确的授权门之后修改，并用实际
结果闭环。npm 只安装这些 Skills，不会用传统 CLI 偷换 Agent 工作流。

> **最短理解方式：** Agent 理解语义；脚本遍历、哈希和校验证据。

---

## 60 秒安装

### Claude Code：精确 `/harness` 调用

```bash
npx harness-armor install --target claude-user
```

然后在任意仓库打开 Claude Code：

```text
/harness
```

仅安装到当前项目：

```bash
npx harness-armor install --target claude-project --project-root .
```

### OpenAI Codex：精确 `$harness` 调用

```bash
npx harness-armor install --target codex-user
```

然后输入：

```text
$harness
```

仅安装到当前项目：

```bash
npx harness-armor install --target codex-project --project-root .
```

Codex 从 `~/.agents/skills` 发现用户级 Skill，从 `.agents/skills` 发现项目级
Skill。每个 Skill 还带有可选 `agents/openai.yaml` 界面元数据，但公共工作流
不依赖这些字段。

### 交互式快捷方式

在交互终端中，直接运行 `npx harness-armor` 会安装到 Claude Code 用户级 Skill
目录。脚本和 CI 应始终显式传入 `--target`。

---

## 一个路由器，六个专业 Skill

```text
                         /harness · $harness
                                  │
                           基于证据判断仓库状态
                                  │
          ┌───────────────┬───────┴────────┬─────────────────┐
          ▼               ▼                ▼                 ▼
        空仓库           只有文档          已有代码          已有 Harness
          │               │                │                 │
    harness-init    harness-build   harness-promotion   check / update
                                                               │
                                  真实开发计划 ────────► harness-prompt
```

| Skill | 何时使用 | 实际输出 | 写入模型 |
| --- | --- | --- | --- |
| `harness` | 不知道从哪里开始 | 状态、证据和唯一推荐路由 | 永远只读 |
| `harness-init` | 空仓库或只有基础文件 | 不虚构事实的文档和状态骨架 | 只创建无冲突的新 Harness 文件 |
| `harness-build` | 有产品文档、没有业务代码 | 有来源追踪的产品定制 Harness | 只写新建/已批准 Harness 文件 |
| `harness-promotion` | 老代码仓库缺少 Agent Harness | 当前架构、命令、风险和边界 | 只写文档/状态，不重构 |
| `harness-update` | Managed 仓库发生变化 | 漂移证据和不可变文件级计划 | 再次明确授权后才写 |
| `harness-check` | 需要审计 Managed/Custom/Mixed Harness | 每项有证据的健康度和问题 | 永远只读 |
| `harness-prompt` | 已有真实实施计划 | 每一步的 Execute/Test/Review Prompt | 只创建新 Prompt 目录 |

Claude 独立安装使用 `/harness-*`；Codex 使用 `$harness-*`：

```text
/harness                 $harness
/harness-init            $harness-init
/harness-build           $harness-build
/harness-promotion       $harness-promotion
/harness-update          $harness-update
/harness-check           $harness-check
/harness-prompt          $harness-prompt
```

用户已经明确专业需求时，路由器不会让用户重复走一遍询问流程。

---

## 仓库状态路由

| 状态 | 证据形态 | 默认路由 |
| --- | --- | --- |
| `EMPTY` | 没有实质文件，或只有 README/LICENSE/编辑器基础文件 | `harness-init` |
| `DOCS_ONLY` | 有产品/设计/需求资料，没有业务代码 | `harness-build` |
| `LEGACY_CODE` | 有业务代码，没有完整 Harness | `harness-promotion` |
| `MANAGED_HARNESS` | 有效 `.harness/manifest.json` | 默认 `harness-check`；同步意图走 `harness-update` |
| `CUSTOM_HARNESS` | 已有连贯的其他 Agent 规范 | `harness-check` |
| `MIXED_OR_CONFLICTED` | Managed 状态无效或证据矛盾 | `harness-check` 只读诊断 |

检测器输出候选状态、置信度、证据和不确定项；涉及文档语义冲突时，宿主 Agent
必须继续阅读相关文件，而不是让脚本伪装理解产品。

---

## 安全不是附加项，而是工作流本身

1. **先列证据**：项目结论只能是 `CONFIRMED`、`INFERRED`、`UNRESOLVED`
   或 `CONFLICTED`，并带来源。
2. **先读后改**：Agent 先读取适用指令、产品、架构、测试和所有权。
3. **文件级边界**：每个 Skill 明确允许与禁止修改的路径。
4. **独立授权门**：`harness-update` 在用户批准计划前连时间戳都不写。
5. **禁止静默覆盖**：用户修改或 Managed Section 冲突会停止工作流。
6. **只报告真实验证**：没运行的测试就是没运行；占位实现不是完成。
7. **角色独立**：Execute、Test、Review Prompt 不允许执行者自证通过。

确定性扫描器会排除密钥、依赖、缓存和构建产物，尊重 `.gitignore`，跳过
符号链接，设置文件数/大小上限，并默认输出只读 JSON。

---

## 内部辅助脚本

所有运行时脚本使用 Python 3.9+ 标准库，不调用额外模型 API，也不修改业务代码。

| 脚本 | 作用 |
| --- | --- |
| `detect_repository_state.py` | 候选状态、证据、置信度与路由 |
| `scan_repository.py` | 有边界的文件清单、排除原因和文件类型 |
| `fingerprint_sources.py` | 稳定 SHA-256 来源指纹 |
| `validate_manifest.py` | Managed 状态和所有权校验 |
| `validate_harness_structure.py` | 必需文件、Manifest 与本地链接 |
| `check_references.py` | Markdown、资源、模板、脚本断链 |
| `detect_drift.py` | 来源和 Managed Content 漂移 |
| `score_harness_health.py` | 机器可验证维度与扣分证据 |

稳定退出码：`0` 成功、`1` 发现问题、`2` 用法错误、`3` 运行/文件系统错误、
`4` 安全上限导致扫描不完整。

---

## 安装方式

### Claude Code Plugin Marketplace

```bash
claude plugin marketplace add atlax-tech/harness-armor
claude plugin install harness-armor@harness-armor
```

当前 Claude Code Plugin 中的 Skill 会带命名空间，因此 Marketplace 调用是：

```text
/harness-armor:harness
/harness-armor:harness-init
```

如需精确无命名空间的 `/harness`、`/harness-init`，请使用前面的
`claude-user` 或 `claude-project` 独立安装。

### Cursor

```bash
npx harness-armor install --target cursor-user
npx harness-armor install --target cursor-project --project-root .
```

### TRAE

```bash
npx harness-armor install --target trae-project --project-root .
```

TRAE 项目 Adapter 使用开放 `.agents/skills` 布局；本仓库尚未在真实 TRAE 客户端
执行发现和调用 smoke test。

### 通用 Agent Skills 客户端

```bash
npx harness-armor install --target generic --dest /绝对路径/skills
```

无法确认原生目录的客户端只标记为 **Generic Agent Skills compatible**，不会伪造
原生兼容。

### 更新、诊断与卸载

```bash
npx harness-armor@latest update --target codex-user
npx harness-armor doctor --target codex-user
npx harness-armor uninstall --target codex-user
npx harness-armor version
```

安装器记录所有文件 SHA-256。更新拒绝覆盖本地修改，先 staging 完整新版本，并在
失败时回滚；卸载只删除哈希仍匹配的所有文件，用户修改会被保留。

> CLI 只接受 `install`、`update`、`uninstall`、`doctor`、`version`。
> 不存在 `harmor init`、`harmor build` 等业务命令。

---

## 兼容状态

| 客户端 / 平台 | 安装 Adapter | 元数据/结构测试 | 真实客户端调用 |
| --- | --- | --- | --- |
| Claude Code 独立 Skills | 用户级 + 项目级 | 本地通过 | 当前 checkout 未运行 |
| Claude Code Marketplace | Marketplace JSON | JSON/资源测试通过 | 未运行；已明确命名空间调用 |
| OpenAI Codex | 用户级 + 项目级 | 布局和 relocated 脚本通过 | 当前 checkout 未运行 |
| Cursor | 用户级 + 项目级 | Adapter 本地测试通过 | 未运行 |
| TRAE | 项目 `.agents/skills` | Adapter 本地测试通过 | 未运行 |
| Generic client | 绝对目录 | 本地端到端 smoke 通过 | 取决于客户端 |
| macOS | 当前开发主机 | **47/47 测试通过** | 本地已验证 |
| Linux | GitHub Actions 已配置 | 尚未运行 | 未验证 |
| Windows | GitHub Actions 已配置 | 尚未运行 | 未验证 |

证据和声明边界见[兼容性记录](docs/compatibility.md)。

---

## Managed 仓库中会出现什么

宿主 Agent 根据真实证据定制输出，不会机械生成所有候选文件。

```text
AGENTS.md                         简短入口与知识地图
docs/
├── PRODUCT.md                    产品事实与需求来源
├── ARCHITECTURE.md               清楚区分当前与建议架构
├── DESIGN.md                     用户与系统设计约束
├── DEVELOPMENT.md                已验证命令与修改规则
├── TESTING.md                    验证策略
├── ACCEPTANCE.md                 完成证据和人工验收
├── ROADMAP.md                    有来源的开发计划
├── decisions/                    持久决策
└── development-log/              实际改动、验证、人工验收
.harness/
├── manifest.json                 版本、所有权和 Managed Paths
├── source-index.json             来源定位和 SHA-256
└── unresolved.json               缺口与冲突
```

`AGENTS.md` 始终保持简短；细节进入聚焦文档，通过链接连接，而不是复制大量内容
制造“看起来很完整”的错觉。

---

## 仓库架构

```text
skills/                           七个独立公共工作流
shared/
├── spec/                         唯一 Harness Engineering v1 规范
├── schemas/                      Manifest/来源/缺口/扫描 Schema
├── templates/                    不虚构事实的通用模板
├── scripts/                      确定性 Python 证据引擎
└── evals/                        健康度、触发和工作流合同
installer/                        只负责分发的 Node.js 安装器
tests/
├── fixtures/                     十种真实仓库形态
├── scripts/                      安全、上限、漂移、健康度
├── skills/                       开放 Skill 结构与边界
├── installation/                 Adapter、relocation、冲突、卸载
└── evals/                        中英文触发/工作流语料
```

源码和 Plugin 布局保留 `skills/` 与 `shared/`。独立安装把七个 Skill 放在客户端
Skill 根目录，把唯一共享运行时放进安装器所有的 `.harness-armor/` 兄弟目录，
全程不使用符号链接。

---

## 验证

```bash
npm test
npm run lint:markdown
npm pack --dry-run --json
```

本地 47 项测试全部通过，跳过 0。CI 已定义 Skill 规范、脚本、全部 Fixture 路由、
触发/工作流合同、断链、Markdown、npm payload 和 Windows/macOS/Linux 安装矩阵。
“写了 CI 文件”不等于“远端已经通过”；发布前必须查看真实 Actions 结果。

---

## 自定义与扩展

- 规范行为先修改 `shared/spec/`。
- `SKILL.md` 保持精简：详细规则进 `references/`，模板进 `assets/`，确定性处理进
  `scripts/`。
- 相邻 Skill 边界变化时同时新增 near-miss 触发用例。
- 支持新的仓库信号前先增加 Fixture oracle。
- 只有官方目录和调用方式有文档并通过真实 smoke test 后，才增加原生客户端
  Adapter。

贡献前阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 限制

- 确定性脚本不能理解产品语义，宿主 Agent 必须读取相关来源。
- `MIXED_OR_CONFLICTED` 有意采取保守判断。
- Claude Code、Codex、Cursor、TRAE 的真实调用需要对应客户端和认证环境，本仓库
  不会把模拟测试宣称为真实通过。
- GitHub owner 为 `atlax-tech`；npm 发布身份尚未确定，Marketplace 命令已使用真实 owner。
- 本仓库采用 CC BY-NC 4.0 公开源代码；因含非商业限制，它不是 OSI 认可的
  Open Source License。

## License

[Creative Commons Attribution-NonCommercial 4.0 International](LICENSE)。个人、
学习和研究可自由使用；公开衍生作品需要署名，商业使用需要另行授权。

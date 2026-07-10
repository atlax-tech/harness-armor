# 任务

在当前空仓库完整实现开源 Agent Skills 套件 **Harness Armor**。

Harness Armor 的产品形态必须对标 `iamzifei/show-me-the-money`：

* 它是一套可以在 AI 编程 Agent 中显式调用的 Skills；
* 用户通过 `/harness-init`、`$harness-init` 等 Skill 入口调用；
* Skill 加载后，由宿主 Agent 按 `SKILL.md` 中定义的工作流读取仓库、分析文档、调用工具并修改文件；
* 可以包含脚本、模板、Schema 和参考资料；
* 不得将核心能力实现成传统 CLI 子命令；
* npm、Claude Plugin 或安装脚本只负责安装、更新和卸载 Skills。

产品名称：

```text
Harness Armor
```

仓库名称：

```text
harness-armor
```

一句话定义：

```text
Suit up any repository with a maintainable Harness Engineering system.
```

---

# 交付目标

实现以下七个可独立调用的 Agent Skills：

```text
harness
harness-init
harness-build
harness-promotion
harness-update
harness-check
harness-prompt
```

Claude Code 调用方式：

```text
/harness
/harness-init
/harness-build
/harness-promotion
/harness-update
/harness-check
/harness-prompt
```

Codex 调用方式：

```text
$harness
$harness-init
$harness-build
$harness-promotion
$harness-update
$harness-check
$harness-prompt
```

Cursor、TRAE 及其他 Agent Skills 兼容客户端使用各自支持的显式 Skill 调用方式。

---

# 产品边界

## 必须实现

1. 七个符合开放 Agent Skills 规范的 Skill；
2. 每个 Skill 都有独立 `SKILL.md`；
3. 每个 Skill 可包含并调用自身的：

   * `scripts/`
   * `references/`
   * `assets/`
4. 一套共享且版本化的 Harness Engineering 规范；
5. Harness 模板；
6. 仓库状态识别脚本；
7. 文档和代码扫描辅助脚本；
8. Harness 结构健康检查脚本；
9. Manifest、来源追踪和漂移检测规则；
10. Prompt 生成模板；
11. Claude Code Plugin 安装方式；
12. Codex Skills 安装方式；
13. Cursor、TRAE 和通用 Skills 目录安装方式；
14. npm/npx 安装器；
15. 完整测试、Skill Evals、Fixtures、CI 和中英文文档。

## 不得实现成

```text
harmor init
harmor build
harmor promotion
harmor update
harmor check
harmor prompt
```

以上传统 CLI 子命令不得成为产品核心调用方式。

允许存在的 CLI 仅限：

```text
install
update
uninstall
doctor
version
```

该 CLI 只负责 Skills 的分发和安装，不负责代替 Agent 执行 Harness 工作流。

---

# 核心运行模型

每次调用 Skill 后，由宿主 Agent执行：

```text
加载 Skill
→ 判断当前仓库状态
→ 读取必要文档和代码
→ 调用 Skill 内部辅助脚本
→ 建立事实清单
→ 按 Harness Armor 规范形成操作计划
→ 根据授权规则修改仓库
→ 执行验证
→ 输出结果和人工验收方式
```

职责边界：

## 宿主 Agent 负责

* 理解产品文档；
* 理解业务语义；
* 阅读代码；
* 判断模块关系；
* 识别文档冲突；
* 制定项目定制方案；
* 生成和修改工程文档；
* 调用文件工具、搜索工具和 Shell；
* 根据用户授权执行修改；
* 验证最终结果。

## Skill 内部脚本负责

仅处理适合确定性执行的操作：

* 遍历仓库文件；
* 应用排除规则；
* 识别文件类型；
* 计算哈希；
* 检测文档变化；
* 生成目录清单；
* 校验 JSON/YAML；
* 校验 Harness 文件结构；
* 检测断链引用；
* 计算 Harness 健康指标；
* 检测 Managed Section；
* 输出机器可读扫描结果。

脚本不得：

* 调用外部 LLM API；
* 替代 Agent 理解产品语义；
* 根据关键词擅自生成业务结论；
* 修改业务代码；
* 静默覆盖用户文件。

---

# 仓库结构

至少实现：

```text
harness-armor/
├── skills/
│   ├── harness/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── harness-init/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   ├── references/
│   │   └── assets/
│   ├── harness-build/
│   ├── harness-promotion/
│   ├── harness-update/
│   ├── harness-check/
│   └── harness-prompt/
├── shared/
│   ├── spec/
│   ├── schemas/
│   ├── templates/
│   └── evals/
├── installer/
├── tests/
│   ├── fixtures/
│   ├── scripts/
│   ├── skills/
│   └── installation/
├── .claude-plugin/
├── .github/workflows/
├── AGENTS.md
├── README.md
├── README.zh-CN.md
├── package.json
├── LICENSE
└── CHANGELOG.md
```

允许根据开放 Agent Skills 规范和客户端兼容要求调整，但七个 Skill 必须保持独立。

---

# Skill 通用要求

每个 Skill 至少包含：

```text
SKILL.md
references/
assets/
scripts/
```

没有实际需要的空目录可以不提交。

每个 `SKILL.md` 必须：

1. 使用合法 YAML frontmatter；
2. `name` 与目录名一致；
3. `description` 明确说明：

   * Skill 做什么；
   * 何时调用；
   * 不适用于什么场景；
4. 采用命令式步骤；
5. 明确输入；
6. 明确输出；
7. 明确允许修改范围；
8. 明确禁止行为；
9. 明确授权门；
10. 明确验证方式；
11. 明确失败处理；
12. 明确最终输出格式；
13. 主文件保持精简；
14. 详细规则分流到 `references/`；
15. 模板分流到 `assets/`；
16. 确定性处理分流到 `scripts/`；
17. 不复制其他 Skill 的完整内容；
18. 不依赖特定用户的个人项目规则；
19. 不依赖额外模型 API；
20. 不使用未经验证的客户端专属语法作为公共核心。

建议每个 `SKILL.md` 不超过 500 行。

---

# Skill 1：`harness`

作用：总入口、状态识别和 Skill 路由。

调用：

```text
/harness
$harness
```

执行流程：

1. 扫描当前仓库；
2. 判断仓库属于：

   * `EMPTY`
   * `DOCS_ONLY`
   * `LEGACY_CODE`
   * `MANAGED_HARNESS`
   * `CUSTOM_HARNESS`
   * `MIXED_OR_CONFLICTED`
3. 输出判断依据；
4. 路由到最合适的专业 Skill；
5. 用户需求已经明确时直接调用目标 Skill，不重复问问题；
6. 专业 Skill 完成后，根据结果推荐下一步；
7. 不直接实施完整 Harness 修改。

路由规则：

```text
EMPTY                 → harness-init
DOCS_ONLY             → harness-build
LEGACY_CODE           → harness-promotion
MANAGED_HARNESS       → harness-update 或 harness-check
CUSTOM_HARNESS        → harness-check
MIXED_OR_CONFLICTED   → harness-check，只读诊断
```

---

# Skill 2：`harness-init`

适用：

```text
空仓库
或只有 README、LICENSE、.gitignore 等基础文件
```

目标：

为尚未定义产品的项目建立一套可继续填写的通用 Harness Engineering 骨架。

必须：

* 检查仓库状态；
* 不猜测产品功能；
* 不猜测技术栈；
* 不生成业务代码；
* 不覆盖已有文件；
* 生成简短的 `AGENTS.md`；
* 生成必要的项目文档骨架；
* 未知项使用明确占位标记；
* 初始化 Harness 状态记录；
* 执行结构验证；
* 输出下一步建议。

候选输出：

```text
AGENTS.md
docs/
├── PRODUCT.md
├── ARCHITECTURE.md
├── DESIGN.md
├── DEVELOPMENT.md
├── TESTING.md
├── ACCEPTANCE.md
├── ROADMAP.md
├── decisions/
└── development-log/
.harness/
├── manifest.json
├── source-index.json
└── unresolved.json
```

只能生成与空仓库状态匹配的内容，不得填入虚构事实。

---

# Skill 3：`harness-build`

适用：

```text
仓库中存在产品文档
尚无实际业务代码
```

目标：

读取产品资料，理解项目背景，为该产品定制 Harness Engineering 架构。

执行流程：

1. 发现并分类产品资料；
2. 读取所有相关资料；
3. 提取：

   * 产品目标；
   * 用户；
   * 使用场景；
   * 功能要求；
   * 业务规则；
   * 设计要求；
   * 技术约束；
   * 非功能要求；
   * 验收条件；
   * 开发计划；
4. 标记：

   * `CONFIRMED`
   * `INFERRED`
   * `UNRESOLVED`
   * `CONFLICTED`
5. 建立来源追踪；
6. 生成项目定制 Harness；
7. 生成简短 `AGENTS.md`；
8. 生成必要的架构、设计、开发、测试和验收文档；
9. 生成 Harness Manifest；
10. 执行结构与一致性检查；
11. 输出所有未解决和冲突事项。

不得：

* 擅自补充产品需求；
* 擅自缩减产品功能；
* 将明确要求改成未来规划；
* 为方便实现而改变产品链路；
* 生成正式业务代码。

---

# Skill 4：`harness-promotion`

适用：

```text
已有传统代码仓库
但缺少完整 Harness Engineering 架构
```

目标：

读取真实代码、配置、测试和文档，将传统仓库升级为适合 AI Agent 安全参与开发的仓库。

执行流程：

1. 扫描仓库；
2. 识别技术栈；
3. 阅读入口、核心模块和主要配置；
4. 识别：

   * 项目真实架构；
   * 主要业务链路；
   * 模块边界；
   * 构建命令；
   * 启动命令；
   * 测试命令；
   * CI/CD；
   * 数据库与迁移；
   * 外部服务；
   * 环境变量名称；
   * 高风险代码区域；
   * 现有开发规范；
5. 对比 README、设计文档与真实实现；
6. 区分：

   * 当前代码事实；
   * 文档声明；
   * Agent 推断；
   * 推荐改进；
7. 生成适合当前仓库的 Harness；
8. 保留已有规范；
9. 增加必要验证和人工验收要求；
10. 输出需要后续重构的建议，但不自动执行重构。

不得：

* 只看 README；
* 只根据目录名称判断架构；
* 把推荐架构写成当前架构；
* 自动重构业务代码；
* 改变外部行为；
* 运行来源不明或具有破坏性的脚本；
* 宣称未运行的测试已经通过。

---

# Skill 5：`harness-update`

适用：

```text
已经由 Harness Armor 管理的仓库
```

目标：

检测产品、架构、实现和 Harness 之间的变化，并在用户授权后同步更新 Harness。

执行流程：

1. 读取 `.harness/manifest.json`；
2. 扫描当前仓库；
3. 与上次状态对比；
4. 检测：

   * 产品文档变化；
   * 设计变化；
   * 技术架构变化；
   * 模块新增或删除；
   * 测试与命令变化；
   * Harness 文档漂移；
   * 失效规则；
   * 用户修改过的生成内容；
5. 输出：

   * 变化证据；
   * 受影响文件；
   * 建议升级内容；
   * 文件级 Diff 计划；
   * 风险；
6. 等待用户授权；
7. 获得授权后才应用修改；
8. 修改后重新验证；
9. 更新 Manifest；
10. 写入开发日志。

默认只生成建议，不得直接覆盖。

---

# Skill 6：`harness-check`

适用：

```text
任何已有 Harness Engineering 配置的仓库
```

默认模式：

```text
只读检查
```

检查维度：

* 项目可理解性；
* `AGENTS.md` 是否简洁有效；
* 产品、架构和实现一致性；
* 指令冲突；
* 文档漂移；
* 构建和测试命令真实性；
* 变更边界；
* 验证闭环；
* 来源追踪；
* 状态连续性；
* 文件所有权；
* 上下文冗余；
* 跨 Agent 兼容性；
* 更新能力；
* 安全性；
* Harness 是否含有虚构结论。

输出：

```text
总体健康度
各维度分数
评分证据
阻断问题
高优先级问题
普通改进项
文件级优化建议
预计影响范围
```

规则：

* 文件越多不得自动获得更高分；
* 每项扣分必须有证据；
* 不得直接修改；
* 用户授权后才能进入优化流程；
* 对用户自定义 Harness 优先提供兼容改进方案，不强制替换。

---

# Skill 7：`harness-prompt`

适用：

仓库中已经存在：

* 产品定义；
* Harness 约束；
* 开发规划或实施步骤。

目标：

根据真实项目背景和开发规划，为每个步骤生成三种独立工程 Prompt：

```text
execute
test
review
```

输出：

```text
docs/prompts/<plan-name>/
├── PROMPT_INDEX.md
├── step-001/
│   ├── execute.md
│   ├── test.md
│   └── review.md
├── step-002/
│   ├── execute.md
│   ├── test.md
│   └── review.md
└── ...
```

## Execute Prompt

必须包含：

* 单一任务；
* 必读项目文档；
* 当前项目事实；
* 允许修改范围；
* 禁止修改范围；
* 功能要求；
* 技术约束；
* 禁止降级项；
* 验证要求；
* 完成证据；
* Git 小步提交要求；
* 输出格式。

## Test Prompt

必须包含：

* 需求来源；
* 待验证行为；
* 正常路径；
* 异常路径；
* 边界场景；
* 单元测试；
* 集成测试；
* 端到端测试；
* 人工验收；
* 失败证据；
* 判定格式。

## Review Prompt

必须包含：

* 原始任务；
* 项目约束；
* 变更范围；
* Diff 审查；
* 测试证据；
* 回归风险；
* 架构风险；
* 数据和安全风险；
* 严重程度；
* `PASS`
* `CHANGES_REQUIRED`
* `BLOCKED`

执行、测试和审查角色必须相互独立，不允许执行者仅凭自身描述宣布通过。

---

# 共享 Harness 规范

在 `shared/spec/` 建立唯一版本化规范，七个 Skills 共同引用。

至少定义：

1. 项目知识进入仓库；
2. `AGENTS.md` 是短入口和知识地图；
3. 细节进入 `docs/`；
4. 产品、架构、代码、测试和验收可追踪；
5. 事实、推断、缺口和冲突必须区分；
6. Agent 修改前必须读取相关上下文；
7. 每项任务必须有完成证据；
8. 规则应尽可能机器可验证；
9. Harness 必须随产品和实现变化更新；
10. 禁止静默文档漂移；
11. 禁止用大量重复文档制造虚假完整度；
12. 禁止无依据生成项目事实；
13. 禁止自动降低产品需求；
14. 禁止将占位实现视为完成；
15. 用户文件不得被静默覆盖。

---

# 辅助脚本

使用 Python 标准库或 Node.js 实现跨平台辅助脚本。

至少包括：

```text
detect_repository_state
scan_repository
fingerprint_sources
validate_manifest
validate_harness_structure
check_references
detect_drift
score_harness_health
```

脚本必须：

* 可由 Agent 直接执行；
* 提供 `--help`；
* 支持 JSON 输出；
* 返回稳定 Exit Code；
* 不调用外部模型；
* 不修改业务代码；
* 默认只读；
* 错误信息明确；
* 尊重 `.gitignore`；
* 排除密钥、缓存、依赖和构建产物；
* 防止符号链接逃逸；
* 设置文件数量与大小限制；
* 支持 Windows、macOS 和 Linux。

需要写入时，由 Skill 明确授权 Agent 执行文件修改，不得由扫描脚本静默修改。

---

# 安装与分发

## Claude Code

支持 Claude Plugin Marketplace：

```text
claude plugin marketplace add <owner>/harness-armor
claude plugin install harness-armor@harness-armor
```

同时支持安装到：

```text
~/.claude/skills/
.claude/skills/
```

## Codex

支持安装到：

```text
~/.agents/skills/
.agents/skills/
```

并提供 `agents/openai.yaml`，但不得让公共 Skill 核心依赖 OpenAI 专属字段。

## Cursor、TRAE 和其他客户端

根据其当前官方 Skills 目录提供安装 Adapter。

无法确认原生目录的客户端必须标记为：

```text
Generic Agent Skills compatible
```

不得伪造原生兼容。

## npm/npx

允许：

```text
npx harness-armor
npx harness-armor install
npx harness-armor update
npx harness-armor uninstall
npx harness-armor doctor
```

这些命令只能安装、升级、卸载和检查 Skills。

禁止使用 npm CLI 执行实际 Harness 业务流程。

---

# 测试

至少建立以下 Fixtures：

```text
empty-repo
docs-only-repo
legacy-node-repo
legacy-python-repo
legacy-java-repo
managed-harness-repo
custom-harness-repo
drifted-harness-repo
conflicted-docs-repo
mixed-repo
```

测试包括：

## Skill 结构测试

* 七个 Skill 均可通过 Agent Skills 规范校验；
* 名称和目录一致；
* Description 可区分相邻 Skill；
* 所有引用文件存在；
* 所有脚本可运行；
* 不存在断链引用。

## 触发 Evals

覆盖：

* 正确显式调用；
* 正确自然语言触发；
* 不应触发；
* 错误 Skill 拒绝；
* `/harness` 正确路由；
* 中英文表达；
* 相邻 Skill 不混淆。

## 工作流 Evals

使用真实 Fixture 验证：

* 空仓库初始化；
* 产品文档定制；
* 传统仓库升级；
* Harness 漂移检测；
* 自定义 Harness 健康检查；
* Prompt 三角色生成；
* 未授权时不修改；
* 不覆盖用户文件；
* 第二次运行保持幂等；
* 未知信息不会被伪造。

## 安装测试

验证：

* Claude Code 用户级安装；
* Claude Code 项目级安装；
* Codex 用户级安装；
* Codex 项目级安装；
* Cursor；
* TRAE；
* 自定义目录；
* 更新；
* 卸载；
* 用户修改冲突保护。

---

# CI

GitHub Actions 至少运行：

```text
Skill specification validation
Script tests
Fixture tests
Trigger evals
Workflow evals
Installation tests
Broken-reference checks
Markdown lint
Windows
macOS
Linux
```

---

# README

README 首屏必须包含以下自然搜索关键词：

```text
Harness Engineering
Agent Skills
Claude Code
OpenAI Codex
Cursor
TRAE
AGENTS.md
AI coding agents
Vibe coding
repository automation
```

README 必须明确说明：

* Harness Armor 是 Agent Skills 套件；
* `/harness-*` 和 `$harness-*` 是 Skill 调用；
* npm 命令只负责安装；
* 七个 Skill 的职责；
* 支持矩阵；
* 安全修改模型；
* 60 秒安装；
* 使用示例；
* 限制；
* 自定义扩展方式。

提供完整 `README.zh-CN.md`。

---

# 项目自身工程约束

Harness Armor 自身也采用 Harness Engineering：

* 根目录 `AGENTS.md` 保持简短；
* 细节进入 `docs/`；
* 每个阶段完成后小步 Git 提交；
* Conventional Commits；
* 中文工程开发日志；
* 开发日志必须包含人工验收步骤；
* 不提交阻断性 TODO；
* 不把 Mock、占位和伪实现宣称为完成。

---

# 验收标准

只有同时满足以下条件才能结束：

1. 七个 Skill 均可独立发现和调用；
2. `/harness` 可以路由到正确 Skill；
3. Codex 可以通过 `$skill-name` 调用；
4. Claude Code Plugin 可以安装；
5. npm 安装器只负责分发；
6. 核心能力不依赖传统 CLI；
7. Skill 能通过宿主 Agent 工具完成真实仓库读取和修改；
8. 所有辅助脚本实际可运行；
9. 所有 Fixture 工作流均通过；
10. 未授权更新不会修改仓库；
11. 用户已有文件不会被静默覆盖；
12. 产品事实均可追踪；
13. 不存在虚构事实和需求降级；
14. Prompt 输出具有 Execute/Test/Review 三角色分离；
15. Windows、macOS、Linux 测试通过；
16. README 中所有安装和调用命令经过实际验证。

---

# 最终报告

完成后只输出：

1. 七个 Skills；
2. 每个 Skill 的实际调用方式；
3. Skill 目录结构；
4. 内部辅助脚本；
5. Claude Code、Codex、Cursor、TRAE 安装结果；
6. Skill Evals 结果；
7. Fixture 工作流结果；
8. 跨平台测试结果；
9. Git Commit 列表；
10. 用户人工验收步骤；
11. 尚未验证的客户端兼容能力。

不得把“生成了若干 Markdown 文件”当作完成证据。
README做的精致一点，可以参考：[iamzifei/show-me-the-money](https://github.com/iamzifei/show-me-the-money) 的README，需要配图的话自己生成。
License也同样参考使用：[iamzifei/show-me-the-money](https://github.com/iamzifei/show-me-the-money) 同款License，Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)。

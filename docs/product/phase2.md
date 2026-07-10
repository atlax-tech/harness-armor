# Harness Armor 第二阶段策略

## 一、核心判断

你的担忧方向正确，但需要修正一个前提：

> **Skills 短期内不会消失；会被淘汰的是“只有一份长 Markdown、靠文字提醒模型守规矩”的静态 Skill。**

截至 2026 年 7 月，OpenAI 仍将 Skills 明确定义为 Codex 的“可复用工作流创作格式”，支持脚本、引用、资源、插件分发，并已覆盖 Codex CLI、桌面端和 IDE Extension。Skills 采用渐进式加载，本身就是模型能力之外的工作流封装层。

变化发生在 Skill 的内部形态：

```text
旧形态
SKILL.md
→ 给模型大量说明
→ 模型自行判断
→ 输出文件

新形态
Skill 入口
→ 结构化工具
→ 持久化状态机
→ 有预算的执行循环
→ 独立验证
→ 运行记录
→ Eval 驱动的优化
```

因此，Harness Armor 不应该放弃 Skills，也不需要改变现在七个入口。正确方向是：

> **Skills 继续负责意图、策略、授权和跨客户端入口；真正的产品核心下沉为 Tool-first Harness Runtime、Armor Loop 和 Eval-gated Learning System。**

推荐新的产品定位：

> **Harness Armor is a self-improving, tool-first repository control plane for AI coding agents, delivered as portable Agent Skills.**

中文：

> **面向 AI 编码 Agent 的自优化、工具优先仓库控制层，以跨平台 Agent Skills 形式交付。**

---

# 二、当前仓库审计

## 1. 首版完成度

| 维度              |    审计判断 |
| --------------- | ------: |
| 原始产品链路完成度       | **88%** |
| Skills 结构与职责边界  | **90%** |
| 确定性证据与安全层       | **85%** |
| 安装与跨客户端分发       | **78%** |
| 真实模型 E2E 验证     | **45%** |
| Loop 能力         | **30%** |
| 自迭代能力           | **20%** |
| Tool-first 完整度  | **40%** |
| GitHub 发布与增长准备度 | **55%** |

这些是代码审计判断，不是仓库当前健康度脚本生成的分数。

## 2. 已完成得较好的部分

目前已经不属于“纯 Markdown Skill”：

* 七个完整生命周期入口；
* 仓库状态分类；
* 产品来源指纹；
* Harness Manifest；
* 漂移检测；
* 结构校验；
* 引用检查；
* 健康评分；
* 文件所有权与授权边界；
* 安装、升级、卸载冲突保护；
* execute/test/review 三角色 Prompt。

README 已明确将宿主 Agent 与确定性脚本分工：Agent 负责语义理解，脚本负责清点、哈希和证据验证；npm 只负责安装 Skills，不替代 Agent 工作流。

`harness-update` 也已经具备比较严谨的双阶段授权模型：先只读检测漂移、生成文件级计划，再等待明确授权；授权前连时间戳和 Manifest 都不能修改。

扫描器具备文件数量、单文件体积、总字节限制，并排除了敏感文件、依赖目录、构建产物、符号链接和 Windows reparse points。

## 3. 目前最大的能力缺口

### 缺口 A：`harness-update` 是同步，不是自优化

当前更新逻辑主要依赖哈希：

```text
上次 SHA-256
vs
当前 SHA-256
```

它能确认“发生了变化”，不能回答：

* 某条规则是否经常被 Agent 忽略；
* 哪个文档没有实际帮助；
* 哪条约束造成重复失败；
* 用户每次都在纠正什么；
* 哪个 Skill 步骤成功率最低；
* 某条规则是否应该从文档提升为机器检查。

现有漂移检测只比较 Managed Files 和 Source Index 的指纹。

### 缺口 B：没有运行轨迹

当前 Manifest 记录：

* 规范版本；
* 生成器版本；
* 仓库状态；
* 管理文件；
* 来源索引；
* 未解决项；
* 最后更新时间。

但没有记录：

* 调用了哪个 Skill；
* Agent 使用了哪些工具；
* 生成了什么计划；
* 用户批准或拒绝了什么；
* 哪些验证失败；
* 修复了几次；
* 最终结果；
* 用户事后进行了什么纠正。

没有 Trace，就没有真正的 Learning Loop。

### 缺口 C：当前 Evals 主要是合同检查

现有测试很好地检查了：

* 每个 Skill 是否有中英文触发语料；
* `/` 和 `$` 调用是否覆盖；
* Fixture 是否覆盖各类仓库；
* Workflow 声明是否包含授权、只读、角色分离等要求。

但这些测试主要验证 JSON 语料和断言是否存在，没有实际调用 Claude Code 或 Codex，不能证明模型真的会稳定完成对应工作流。

Workflow Evals 当前也只是“Fixture + 期望断言”的声明集合。

### 缺口 D：Tool-first 仍然是脚本辅助

当前八个 Python 工具已经提供确定性能力，但调用方式本质还是：

```text
SKILL.md 告诉 Agent
→ Agent 运行 Python 脚本
→ Agent 读取 JSON
→ Agent 自己继续
```

这比纯文档先进，但还没有形成正式工具契约：

* 没有统一 Tool Schema；
* 没有 plan/apply/verify/rollback 工具协议；
* 没有 immutable plan ID；
* 没有工具级权限；
* 没有统一运行状态；
* 没有跨 Skill 的 Tool Registry；
* 没有 MCP 接口。

Anthropic 对 Tool-first 的定义更严格：工具应当是带输入输出 Schema 的结构化操作，Agent 通过标准工具循环调用；当系统需要结构化决策，却还要用正则从模型文本里提取时，通常说明这部分应该成为工具。

## 4. 当前发布证据边界

仓库开发日志记录本地 `47/47` 测试通过；README 仍明确标注真实 Claude Code、Codex、Cursor、TRAE 调用没有在该 checkout 中执行，Linux 和 Windows 远端结果尚未确认。

本次审计查看了 main 分支源码、提交、测试和 CI 定义，但没有在独立 Runner 中重新执行完整测试。因此首版可以视为“代码实现完成”，还不能视为“跨客户端公开发行验证完成”。

---

# 三、趋势研究结论

## 1. 模型原生能力会吸收基础 Harness，但不会吸收项目事实

更强模型会逐渐内置：

* 先读代码再修改；
* 自动制定计划；
* 自动调用测试；
* 自动 Review；
* 自动循环修复；
* 自动选择工具；
* 自动分配子 Agent。

但模型不可能预先知道：

* 你的真实产品定义；
* 当前仓库的设计决策；
* 哪些行为明确禁止；
* 哪些历史方案已被否决；
* 用户如何验收；
* 当前业务风险；
* 哪些文件属于谁；
* 哪个命令在该仓库真实有效。

所以未来的壁垒不能是：

> 教模型“开发前先读文档”。

而应该是：

> **把特定仓库的事实、工具、边界、状态、验证和反馈转化为模型可以直接操作的控制系统。**

OpenAI 自己也明确表示，随着 Agent 能力提高，最重要的投资正在转向环境、工具、反馈循环和控制系统，而不只是 Prompt。

## 2. Tool-first 已经从理念进入基础设施层

Claude Fable 5 目前支持 Tool Search 和 Programmatic Tool Calling。Tool Search 可以按需发现工具，而不是把全部 Tool Definition 放入上下文；官方称当工具超过 30–50 个时选择准确率会下降，按需搜索可以避免上下文膨胀。

Programmatic Tool Calling 允许模型生成代码批量调用工具、过滤结果，再只把最终结果返回上下文。Anthropic 的评测中，多工具研究任务平均提升 11%，输入 Token 减少 24%；在含 10–49 个工具的生产请求中，典型 Token 节省为 20%–40%。

但 Harness Armor 目前只有八个核心脚本，**暂时没有必要为 Tool Search 过度设计**。更合理的是先建立稳定的 8–12 个工具契约。

## 3. Loop 的重点不是无限重复

Claude 官方定义的 Agentic Loop 是：

```text
模型请求工具
→ 执行工具
→ 返回结果
→ 模型继续判断
→ 直到 end_turn 或其他停止原因
```

高级 Orchestration 则增加：

* 并发上限；
* 总子任务上限；
* 主 Agent Turn 上限；
* 子 Agent Turn 上限；
* 持久化 Journal；
* Verification Wave；
* Completeness Critic；
* 多阶段执行。

所以 Harness Armor 应实现的是：

> **有状态、有预算、有终止条件、有独立审查、有失败恢复的工程 Loop。**

不能只是让 Agent “继续尝试直到成功”。

## 4. 自优化不能等于自动改写自身

OpenAI 的自优化案例依赖三个支柱：

1. 专家纠正；
2. 完整生产 Trace；
3. 定制 Eval 驱动的 Codex 改进循环。

系统不会把每次纠正立即转成修改。只有重复问题被审核、聚类，并形成有明确成功条件的 Eval 后，才成为有边界的改进任务。

因此 Harness Armor 的“自优化”应是：

```text
运行结果
→ 捕获失败和用户纠正
→ 聚类重复问题
→ 形成改进候选
→ 生成针对性 Eval
→ 候选版本与当前版本对比
→ 回归测试
→ 用户批准
→ 采用或放弃
```

而不是每次调用都让 Skill 自己修改 `SKILL.md`。后者很容易造成规则漂移和自我污染。

---

# 四、目标产品架构

保持现在七个公开 Skill 不变：

```text
/harness
/harness-init
/harness-build
/harness-promotion
/harness-update
/harness-check
/harness-prompt
```

在其下面增加四层：

```text
┌─────────────────────────────────────┐
│ Skills：意图、路由、策略、用户授权   │
├─────────────────────────────────────┤
│ Armor Loop：状态机、预算、重试、恢复 │
├─────────────────────────────────────┤
│ Tool Runtime：结构化仓库操作工具     │
├─────────────────────────────────────┤
│ Evidence & Learning：Trace、Eval、学习│
└─────────────────────────────────────┘
```

## Tool Runtime

建议首先实现以下内部工具：

```text
inspect_repository
classify_repository
index_evidence
query_evidence
detect_harness_drift
build_change_plan
validate_change_plan
apply_managed_patch
verify_harness
rollback_run
record_outcome
propose_improvement
```

关键要求：

* 每个工具有严格 JSON Schema；
* 工具返回事实，不返回冗长自然语言；
* 修改类工具必须要求 `plan_id` 和 `approval_token`；
* Plan 包含输入文件指纹；
* 证据发生变化后自动使授权失效；
* Apply 只能执行 Plan 中列出的变更；
* Verify 不由 Apply 工具自行宣布成功；
* Rollback 使用运行前快照；
* 所有工具写入统一 Run Trace。

实现形态优先考虑：

```text
本地 MCP Server
+
现有脚本兼容入口
```

MCP 是为了向 Claude Code、Codex 和其他支持 MCP 的 Agent 暴露正式工具；现有 Python 脚本继续作为不支持 MCP 客户端的 fallback。它不是传统业务 CLI，也不改变当前 Skill 调用方式。

---

# 五、Armor Loop

建议新增内部 Loop Runtime，不急着新增公开 `/harness-loop` Skill。

状态机：

```text
DISCOVER
→ PLAN
→ VALIDATE_PLAN
→ AWAIT_APPROVAL
→ APPLY
→ VERIFY
→ CRITIQUE
→ REPAIR
→ LEARN
→ DONE
```

异常出口：

```text
ESCALATE
ROLLBACK
BLOCKED
BUDGET_EXHAUSTED
```

每次运行必须记录：

```json
{
  "run_id": "...",
  "skill": "harness-update",
  "state": "VERIFY",
  "repository_fingerprint": "...",
  "plan_id": "...",
  "approved_scope": [],
  "tools_called": [],
  "files_changed": [],
  "validations": [],
  "failures": [],
  "repairs": [],
  "user_corrections": [],
  "verdict": "..."
}
```

Loop 必须有硬限制：

* 最大循环次数；
* 最大工具调用数；
* 最大并行任务；
* 最大修改文件数；
* 最大总 Diff；
* 超时；
* 风险等级；
* 必须人工判断的条件。

## 七个 Skill 如何接入 Loop

### `harness-init`

```text
扫描
→ 生成骨架计划
→ 检查是否虚构事实
→ 写入
→ 校验结构
→ 自动修复一次
→ 输出
```

### `harness-build`

```text
来源发现
→ 事实提取
→ 冲突批判
→ Harness 生成
→ 来源回查
→ 非虚构审查
→ 修复
```

### `harness-promotion`

```text
并行扫描入口/模块/测试/配置
→ 架构综合
→ 独立 Reality Critic
→ 生成 Harness
→ 验证没有修改业务代码
```

### `harness-update`

保留现有双阶段授权：

```text
检测变化
→ 生成计划
→ 用户授权
→ 应用
→ 验证
→ Critic 检查遗漏和错误同步
→ 有边界修复
```

### `harness-check`

保持只读，但使用：

```text
多个维度 Scout
→ 证据汇总
→ Completeness Critic
→ Adversarial Reviewer
→ 最终健康报告
```

### `harness-prompt`

```text
生成三类 Prompt
→ Prompt Linter
→ 需求覆盖检查
→ 角色独立性检查
→ Critic
→ 自动修复
```

---

# 六、自迭代系统

## 1. 项目级学习

新增：

```text
.harness/
├── runs/
├── learning/
│   ├── corrections.jsonl
│   ├── failure-patterns.jsonl
│   ├── candidates.jsonl
│   └── adopted.jsonl
└── evals/
```

捕获信号：

* 用户明确纠正；
* 用户拒绝某项建议；
* 同类验证连续失败；
* Agent 多次读取无效文档；
* 某条规则频繁被违反；
* 某个工具经常返回错误；
* 某个未解决项长期未解决；
* 相同手动验收失败反复出现。

## 2. 改进候选

例如：

```json
{
  "candidate_id": "HA-LEARN-0042",
  "source_runs": ["run-12", "run-19", "run-25"],
  "pattern": "Agent repeatedly treats README commands as verified",
  "proposed_change": {
    "target": "harness-promotion",
    "type": "workflow-rule",
    "summary": "Require command-source validation before recording commands"
  },
  "targeted_evals": [],
  "status": "PROPOSED"
}
```

## 3. Eval Gate

采用前必须完成：

```text
当前版本跑基准
→ 候选版本跑相同基准
→ 针对失败模式跑 Targeted Eval
→ 跑全部回归
→ 对比成功率、误触发、Token、耗时
→ 无回归才允许采用
```

原则：

* 项目级 Harness 可以自动提出改进；
* 修改项目 Harness 仍需要用户授权；
* 全局安装的 Harness Armor Skills 不允许被项目运行静默改写；
* 全局改进候选只能生成 Patch/Issue/PR；
* 每次采用都必须可回滚。

这样才能称为 **self-improving**，而不是 self-mutating。

---

# 七、用户体验优化

## 1. `/harness` 同轮自动路由

当前 Router 更接近“判断后交接”。下一版应尽量做到：

```text
/harness
→ 判断状态
→ 展示一句判断
→ 同一轮继续执行对应 Specialist
```

除非客户端无法继续调用 Skill，才要求用户再次输入命令。

## 2. 统一 Armor Status

所有 Skill 开头只展示：

```text
Repository: LEGACY_CODE
Confidence: 94%
Mode: SAFE
Risk: Medium
Action: Promote repository
Writes: Harness files only
Approval: Existing-file edits require approval
```

不要先输出大段方法说明。

## 3. 三种模式

```text
SAFE
默认模式，严格授权，保守循环

LOOP
允许在批准范围内自动验证和修复

AUTONOMOUS
允许多阶段循环、子 Agent 和 PR 级交付
```

首版只正式提供 `SAFE` 和 `LOOP`。`AUTONOMOUS` 等真实客户端 Eval 足够后再公开。

## 4. Capability Doctor

安装后检测：

* Agent 客户端；
* Skills 目录；
* Python/Node；
* MCP；
* Hooks；
* Subagents；
* Worktree；
* Loop/Orchestration 能力；
* Git；
* GitHub CLI；
* 当前可用模式。

根据能力退化：

```text
MCP + Subagents
→ 完整智能模式

只有 Shell + File Tools
→ Script fallback 模式

只有 Skills
→ Guided workflow 模式
```

## 5. Run Receipt

每次完成输出短收据：

```text
Run: HA-20260711-003
Result: PASS
Evidence: 23 files inspected
Changed: 8 Harness files
Verified: structure, links, manifest, source traceability
Repairs: 1
Residual risks: 2
Resume: /harness-update --run HA-20260711-003
```

用户不需要阅读整份内部过程，但可以追踪和恢复。

---

# 八、竞争差异

GitHub 已出现多个 `harness-engineering-skill` 项目。部分项目只包含：

* Bootstrap；
* Existing repo migration；
* 文档结构；
* Validator。

例如 `JacobLinCool/harness-engineering-skill` 主要覆盖 Bootstrap、Migration 和文档拓扑校验。

Harness Armor 当前已经多出：

* 六类仓库生命周期；
* 总 Router；
* 来源证据；
* 漂移检测；
* 用户授权；
* 文件所有权；
* 跨客户端安装；
* Prompt 三角色；
* 自定义 Harness 审计。

但“Tool-first”本身也已经被同类项目采用。`enterprise-harness-engineering` 已明确提出 `Tech Loop × Tool API`，并描述 Human → Agent → Skill → Tool 四层结构。

所以不能仅宣传：

> 我们支持 Tool-first。

真正有区分度的主张应是：

> **Harness Armor turns repository evidence, permissions, tools, verification and user corrections into a portable self-improving control loop.**

护城河顺序：

```text
生命周期闭环
→ 确定性证据
→ 安全授权
→ Tool Runtime
→ 可恢复 Loop
→ Outcome Traces
→ Eval-gated Self-improvement
```

---

# 九、GitHub 站内 SEO

## 1. 首先处理重复仓库

GitHub 搜索当前同时返回：

```text
AtlaxTech/harness-armor
atlax-tech/harness-armor
```

前者是空的个人仓库，后者是正式组织仓库。这会分散用户判断，也可能造成外链、Star 和搜索点击信号分裂。

处理方式：

* 最优：删除空个人仓库；
* 或将其归档；
* README 仅保留醒目的 canonical repository 跳转；
* 不在两个仓库同时维护内容。

## 2. 修改 GitHub About Description

建议：

```text
Self-improving, tool-first Harness Engineering Agent Skills for Claude Code, Codex, Cursor and TRAE. Build, audit, update and verify AGENTS.md-based repositories.
```

GitHub 默认仓库搜索只检索：

* Repository Name；
* Description；
* Topics。

README 只有用户显式使用 `in:readme` 时才参与仓库搜索。

所以关键词不能只放在 README 和 `package.json`。

## 3. 设置 GitHub Topics

建议控制在 15–20 个：

```text
harness-engineering
agent-skills
claude-code
codex
cursor
trae
agents-md
ai-coding-agent
vibe-coding
repository-automation
tool-use
agentic-loop
self-improving-agents
context-engineering
mcp
evals
agent-first
developer-tools
codebase-onboarding
llm-tools
```

GitHub Topics 会进入默认仓库检索，也可以通过 Topic 页面发现相关项目；GitHub 允许最多 20 个 Topic。

## 4. 重构 README 首屏

当前首屏视觉已经不错，但价值主张仍偏抽象。

建议首屏直接形成：

```text
Harness Armor

The self-improving, tool-first Harness Engineering system
for Claude Code, Codex, Cursor and TRAE.

✓ Empty repo → agent-ready architecture
✓ Product docs → project-specific Harness
✓ Legacy code → safe AI development environment
✓ Repository changes → drift detection and sync
✓ Existing Harness → evidence-backed audit
✓ Development plan → execute/test/review prompts
```

然后立即放：

```text
npx harness-armor install --target claude-user
/harness
```

## 5. 增加可传播 Demo

制作一个 30–60 秒 GIF：

```text
传统仓库
→ /harness
→ 自动识别 LEGACY_CODE
→ 扫描代码与测试
→ 展示 Harness Promotion Plan
→ 生成 AGENTS.md / docs / .harness
→ 验证通过
```

这比架构说明更容易获得 Star 和转载。

## 6. 增加对比表

| 能力           | 普通 Harness Skill | Harness Armor v0.1 | Adaptive Armor |
| ------------ | ---------------: | -----------------: | -------------: |
| 文档模板         |                ✅ |                  ✅ |              ✅ |
| 传统代码仓库分析     |               部分 |                  ✅ |              ✅ |
| 来源追踪         |                ❌ |                  ✅ |              ✅ |
| 漂移检测         |                ❌ |                  ✅ |              ✅ |
| Tool Runtime |                ❌ |                 部分 |              ✅ |
| 可恢复 Loop     |                ❌ |                  ❌ |              ✅ |
| 运行 Trace     |                ❌ |                  ❌ |              ✅ |
| Eval 驱动自优化   |                ❌ |                  ❌ |              ✅ |

必须准确标记尚未完成的能力，不能把路线图写成现状。

## 7. 建立公开 Benchmark

选取：

* 10 个 Fixture；
* 3–5 个真实开源仓库；
* Claude Code；
* Codex。

比较：

```text
无 Harness
静态 AGENTS.md
普通单 Skill
Harness Armor
Harness Armor Loop
```

指标：

* 任务成功率；
* 虚构事实数量；
* 未授权修改数量；
* 测试实际执行率；
* 人工干预次数；
* 需求遗漏数；
* Token；
* 总耗时；
* 第二次运行漂移；
* 跨会话恢复率。

这会同时成为：

* 技术可信度；
* README 内容；
* 小红书传播内容；
* Hacker News/Reddit 发布素材；
* 后续自优化 Eval 基线。

## 8. 许可证需要重新评估

当前使用 `CC BY-NC 4.0`，仓库自己也承认它不是 OSI 认可的 Open Source License。

这会限制：

* 公司内部采用；
* 商业项目使用；
* 开发工具集成；
* 社区 Fork；
* Awesome List 收录；
* 企业贡献。

建议方案：

```text
代码、脚本、Schema：Apache-2.0 或 MIT
文档和视觉资产：CC BY 4.0
商标和品牌资产：保留权利
```

你仍然可以保护 `Harness Armor` 品牌，但不要用非商业许可证限制整个工具的扩散。

---

# 十、实施优先级

## P0：v0.1.1 可信发布

先完成：

1. 处理重复空仓库；
2. 真实执行 GitHub Actions；
3. Claude Code 真实安装/调用 Smoke Test；
4. Codex 真实安装/调用 Smoke Test；
5. npm 发布；
6. GitHub Release；
7. 设置 About Description；
8. 设置 Topics；
9. 添加真实 CI/npm/release Badge；
10. 重新确定许可证。

## P1：v0.2 Tool-first Runtime

实现：

* 统一 Tool Schema；
* MCP Server；
* Plan ID；
* Approval Token；
* Apply/Verify/Rollback；
* Run Trace；
* Node Runtime 或双 Runtime；
* Skill 使用 Tool，脚本仅作 fallback。

## P2：v0.3 Armor Loop

实现：

* 持久化状态机；
* 最大循环和工具预算；
* Verify/Critic/Repair；
* 失败恢复；
* Resume；
* Host capability detection；
* Sequential 与 Subagent 双模式。

## P3：v0.4 Adaptive Armor

实现：

* 用户纠正捕获；
* 失败模式聚类；
* Improvement Candidate；
* Targeted Eval；
* A/B 对照；
* 回归 Gate；
* 授权采用；
* 自动生成改进 PR。

---

# 最终战略

不要把产品继续定义为：

> 一套自动生成 Harness 文档的 Skills。

应该升级为：

> **Harness Armor 是一个跨 AI 编码 Agent 的 Repository Control Plane。它通过 Skills 接收意图，通过 Tools 获取和修改事实，通过 Loop 完成验证和修复，通过 Traces 与 Evals 持续改进。**

当前七个 Skills 是稳定的公开交互层，不需要推翻。

真正需要替换的是底层：

```text
Prompt-driven
→ Evidence-driven
→ Tool-driven
→ Loop-driven
→ Eval-driven
```

最优先事项不是增加第八个 Skill，而是先完成 **v0.1.1 可信发布**，随后把 v0.2 做成真正的 Tool-first Runtime。等运行 Trace 和 Eval 基础存在后，再对外使用“self-improving”作为核心宣传词。

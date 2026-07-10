# 2026-07-11 真实仓库场景加固

## 完成内容

- 将真实仓暴露的 custom Harness 路由误判固化为 fixture：非标准文件名只要具备 agent
  入口、架构、验证，以及产品/状态/Harness 总览证据，即候选为 `CUSTOM_HARNESS`。
- 增加 docs-only + AGENTS、legacy partial guidance 两个反向 fixture，防止 custom 识别过宽。
- 健康评分按 product / architecture / testing / acceptance / state 等角色发现等价文件，输出
  `layout` 与 `role_evidence`，不再强制 custom Harness 使用 Harness Armor 文件名。
- 中英文识别用户修改保护边界；机器分仍明确保留语义一致性、客户端和真实命令的上限。
- 引用检查新增反引号中的已存在仓库路径覆盖，并区分 explicit 与 inline-existing 计数。
  缺失 inline token 不报错，避免把 API、包名、命令和未来目录误判为断链；零覆盖会输出警告。

## 失败先行证据

- 新 fixture 在旧实现中被判为 `LEGACY_CODE`，预期 `CUSTOM_HARNESS`。
- 旧引用检查返回 `checked_references: 0` 但 `valid: true`。
- 旧健康分为 29.67/100，custom 等价文档和中文保护边界均未获得结构证据。
- 第一版 inline 检查在真实仓误报 API 路由、包名和未来目录；增加风险 fixture 后收紧为只计
  已存在 inline path，显式 Markdown/HTML 链接仍严格检查缺失目标与锚点。

## 验证结果

- `npm test`：54/54 通过。
- `npm run lint:markdown`：通过。
- `python3 -m py_compile shared/scripts/harness_armor/analysis.py`：通过。
- `git diff --check`：通过。
- `send-page-to-gpt` 二次实测：`MANAGED_HARNESS`，结构有效，漂移为零；引用 35 条
  （1 explicit + 34 inline-existing），0 断链；机器结构分 79/100。
- `craeer_echo-fkboss-finder` 二次实测：由错误的 `LEGACY_CODE` 修正为
  `CUSTOM_HARNESS`；发现 237 条 inline-existing 引用并明确给出 inline-only coverage 警告；
  机器结构分从 29.67 提升为 61.5，同时继续扣除无 managed baseline、无明确用户修改保护边界
  等真实缺口。
- 目标仓 `npm run lint` 通过；`npm run test` 43/43 通过。执行前后用户 diff SHA-256 均为
  `03fbed12c8def3713a385d9c6282bb10811399f32f43b63a63ab2a05f64fbc14`，未修改目标仓。

## 限制与未验证项

- 机器评分仍不替代宿主 Agent 的语义审查；第二个真实仓中 42/43 测试数量等文档漂移由
  `harness-check` 的语义步骤报告，而不是根据文件名或文本数字自动猜测。
- 本阶段没有执行真实外部客户端、浏览器 UI 或远端 GitHub Actions；这些不得标记为通过。
- 第二个真实仓的低分项是被正确保留的项目风险，不是通过抬分隐藏的问题。

## 人工验收步骤

1. 对 `tests/fixtures/custom-harness-realistic-repo` 运行 detector，确认路由为
   `CUSTOM_HARNESS -> harness-check`。
2. 对 `docs-only-guided-repo` 与 `legacy-partial-guidance-repo` 运行 detector，确认分别路由
   `harness-build` 与 `harness-promotion`。
3. 在包含显式断链的临时 Markdown 中运行引用检查，确认退出码 1；在零引用仓运行，确认
   `NO_LOCAL_REFERENCES_DETECTED` 和 coverage 警告。
4. 在两个真实仓重复运行 detector/reference/health，检查上面的状态、计数、分数和只读边界。
5. 检查第二个真实仓执行前后的工作区 diff 哈希，确认未覆盖用户修改。

# 2026-07-11 README 维护策略

## 完成内容

- 新增 `docs/README-MAINTENANCE.md`，把中英文 README 定义为每个版本发布前必须共同
  审核的产品发布物。
- 规定中英文必须保持产品承诺、命令、版本、支持范围、验证证据、限制和许可证边界
  等价；若一方无需改文案，也必须在发布开发日志中记录 no-op 审核结论和原因。
- 建立 README 产品页结构、事实来源表、发布前十步流程、阻断条件和人工验收清单。
- 更新根 `AGENTS.md`，强制每次 Release 前读取并执行该策略；任一语言过期、命令未
  验证或证据不一致时禁止创建 Tag/Release。
- 同步 `.harness/manifest.json` 中 `AGENTS.md` 的 managed 文件指纹，避免产生 drift。

## 验证结果

```bash
npm test
# 结果：tests 47, pass 47, fail 0, skipped 0, todo 0

npm run lint:markdown
# 结果：Markdown and local-reference checks passed.

npm pack --dry-run --json
# 结果：harness-armor@0.1.1，entryCount 115，size 1,717,132 bytes

python3 shared/scripts/detect_drift.py .
# 结果：valid_manifest true，has_drift false
```

本阶段不修改业务代码、不改版本、不创建 Tag/Release、不发布 npm。

## 人工验收步骤

1. 从根 `AGENTS.md` 找到 README 维护入口并打开策略文件。
2. 对照策略的事实来源表，检查每类 README 声明都有明确权威来源或实际运行证据。
3. 模拟一个版本号、安装渠道或兼容性状态变化，确认策略要求同一 PR 同步检查中英文。
4. 确认阻断条件明确禁止单语言过期、虚构 npm/Marketplace 可用性或把工作流配置当成
   已通过证据。
5. 在 GitHub 渲染策略文件，检查表格、代码块和 checklist 显示正常。

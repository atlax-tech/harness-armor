# 2026-07-11 README 与发布治理

## 完成内容

- 将英文 README 从偏内部实现说明的长文档重构为产品宣传页，突出产品价值、快速上手、
  七个 Skill 的定位、安全边界、安装目标和真实验证状态。
- 删除 npm registry 已发布的隐含声明。发布前实查 `harness-armor` 在 npm registry
  返回 404，因此快速上手改为从 GitHub checkout 运行本地分发命令。
- 将 Linux/Windows “未运行” 的过期表述更新为当前远端 GitHub Actions 证据：
  Ubuntu、macOS、Windows 共 12 个跨平台矩阵 Check Run 全部成功。
- 增加指向 `quality.yml` 与 `cross-platform.yml` 的动态状态徽章，并保留真实客户端
  验证边界：Claude Code 已验证，Codex、Cursor、TRAE 与 Claude Marketplace 尚未
  进行真实客户端调用验证。
- 保留 CC BY-NC 4.0 的非商业限制提示，避免将 source-available 状态误表述为不受限
  的开源许可。

## 验证结果

```bash
npm test
# 结果：tests 47, pass 47, fail 0, skipped 0, todo 0

npm run lint:markdown
# 结果：Markdown and local-reference checks passed.

npm pack --dry-run --json
# 结果：harness-armor@0.1.1，entryCount 113，size 1,713,659 bytes
```

第一次在受限沙箱中运行 `npm pack --dry-run --json` 时，prepack 的 47 项测试通过，
随后因 `~/.npm/_cacache` 权限返回 EPERM；在允许访问当前用户 npm 缓存的环境中重跑
同一命令后成功。远端还需通过 README Pull Request 触发的 `quality.yml` 和
`cross-platform.yml`，并在最终发布候选上手动触发 `evals.yml`。实际结果在发布完成后
以 GitHub Check Runs 为准。

## 限制

- 未执行从公开 GitHub 仓库直接 `npm exec` 的远程代码运行；该高风险验证请求被执行
  环境拒绝。README 使用可审计的 `git clone` 加本地 `node` 命令，不将远程执行包装成
  已验证证据。
- 本阶段不修改业务代码、不发布 npm 包、不创建 Tag 或 Release。

## 人工验收步骤

1. 打开 GitHub 仓库首页，检查首屏价值主张、徽章、快速上手和兼容性说明是否清晰。
2. 在干净目录克隆仓库，执行 README 中 Claude Code/Codex 的安装命令和 `doctor`。
3. 点击 README 的产品、规范、兼容性和贡献链接，确认均能在 GitHub 正常打开。
4. 检查 README 未把未运行的客户端、工作流或 npm 发布状态标记为已验证。
